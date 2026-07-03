const SUPABASE_URL = 'https://mispbaxtkcglpdsjttja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3pwYmF4dGtjZ2xwZHNqdGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzczOTEsImV4cCI6MjA5ODYxMzM5MX0.9YDKOHV1upxigsZSUXkYr_VNSXAc7CXlcCRu9BbIReA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProfile = null;

async function initAdminPanel() {
  const deployBtn = document.getElementById('deploy-nodes-btn');
  deployBtn?.addEventListener('click', deployRosterNodes);
  document.getElementById('event-form').addEventListener('submit', handleEventSubmit);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    if (localStorage.getItem('bypass_superadmin') === 'true') {
      currentProfile = { character_name: 'superadmin' };
      await loadAdminRosterStream();
      await loadAdminAssistRequests();
      return;
    }

    window.location.href = 'index.html';
    return;
  }

  const charName = session.user.email.split('@')[0];
  const { data: profile } = await supabase.from('profiles').select('*').eq('character_name', charName).single();

  if (!profile || profile.character_name.toLowerCase() !== 'pernzy') {
    alert('ACCESS VIOLATION: Secure administrative validation failed.');
    window.location.href = 'dashboard.html';
    return;
  }

  currentProfile = profile;
  await loadAdminRosterStream();
  await loadAdminAssistRequests();
}

async function loadAdminRosterStream() {
  const { data } = await supabase.from('profiles').select('*').order('character_name', { ascending: true });
  const listContainer = document.getElementById('admin-roster-list');
  const checkGrid = document.getElementById('attendance-check-grid');

  listContainer.innerHTML = '';
  checkGrid.innerHTML = '';

  if (data && data.length) {
    data.forEach((profile) => {
      const isDeactivated = profile.account_status === 'DISCONNECTED';
      listContainer.innerHTML += `
        <div class="flex items-center justify-between text-xs p-1.5 bg-slate-950/40 border border-slate-900 rounded">
          <span class="${isDeactivated ? 'text-slate-600 line-through' : 'text-slate-300 font-bold'}">${profile.character_name}</span>
          ${isDeactivated ? `[DARK_NODE]` : `<button onclick="toggleNodeState('${profile.id}', 'DISCONNECTED')" class="text-[9px] text-pink-400/80 hover:text-pink-300 font-bold uppercase">[🔴 DEACTIVATE]</button>`}
        </div>`;

      if (!isDeactivated) {
        checkGrid.innerHTML += `
          <label class="flex items-center gap-2 p-1.5 hover:bg-slate-900/60 rounded text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" name="attendee-node" value="${profile.character_name}" class="accent-pink-500 rounded bg-slate-900 border-slate-800">
            <span>${profile.character_name}</span>
          </label>`;
      }
    });
  }
}

async function toggleNodeState(profileId, newState) {
  if (!confirm('Confirm security payload change on target roster node?')) return;
  await supabase.from('profiles').update({ account_status: newState }).eq('id', profileId);
  await loadAdminRosterStream();
}

async function deployRosterNodes() {
  const rawInput = document.getElementById('bulk-roster-input').value;
  if (!rawInput.trim()) return;

  const names = rawInput.split(',').map((n) => n.trim()).filter((n) => n);
  for (const name of names) {
    await supabase.from('profiles').insert({ id: crypto.randomUUID(), character_name: name, account_status: 'ACTIVE' });
  }

  document.getElementById('bulk-roster-input').value = '';
  await loadAdminRosterStream();
}

async function handleEventSubmit(event) {
  event.preventDefault();
  const eventPayload = document.getElementById('event-select').value.split('|');
  const eventName = eventPayload[0];
  const pointValue = parseInt(eventPayload[1], 10);
  const imageFile = document.getElementById('event-screenshot').files[0];
  const checkedBoxes = document.querySelectorAll('input[name="attendee-node"]:checked');
  const attendeesArray = Array.from(checkedBoxes).map((cb) => cb.value);

  if (!attendeesArray.length) {
    return alert('Attendee array cannot be empty.');
  }

  const publicUrl = imageFile ? await compressAndUploadReceipt(imageFile) : null;

  await supabase.from('event_ledgers').insert({
    event_name: eventName,
    time_stamp_target: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    point_valency: pointValue,
    attendees: attendeesArray,
    screenshot_url: publicUrl,
  });

  for (const name of attendeesArray) {
    const { data: p } = await supabase.from('profiles').select('current_month_points, rolling_7_day_points').eq('character_name', name).single();
    if (p) {
      await supabase.from('profiles').update({
        current_month_points: p.current_month_points + pointValue,
        rolling_7_day_points: p.rolling_7_day_points + pointValue,
      }).eq('character_name', name);
    }
  }

  alert('Event logged and point systems recompiled!');
  document.getElementById('event-form').reset();
  await loadAdminRosterStream();
}

async function compressAndUploadReceipt(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxW = 1200;
        const scale = maxW / img.width;
        canvas.width = maxW;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          const compressedFile = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const filePath = `receipts/${compressedFile.name}`;
          const { data, error } = await supabase.storage.from('event-proofs').upload(filePath, compressedFile);
          if (error) {
            resolve(null);
          } else {
            const { data: urlData } = supabase.storage.from('event-proofs').getPublicUrl(filePath);
            resolve(urlData.publicUrl);
          }
        }, 'image/jpeg', 0.6);
      };
    };
  });
}

async function loadAdminAssistRequests() {
  const { data } = await supabase.from('assistance_requests').select('*, profiles(character_name)').eq('status', 'PENDING').order('created_at', { ascending: true });
  const container = document.getElementById('admin-assist-container');
  container.innerHTML = '';

  if (data && data.length) {
    data.forEach((req) => {
      container.innerHTML += `
        <div class="p-3 bg-slate-950 border border-slate-800 rounded flex flex-col justify-between text-xs">
          <div><div class="text-pink-400 font-bold mb-1">REQ_NODE: ${req.profiles?.character_name.toUpperCase()}</div><p class="text-slate-400">${req.request_details}</p></div>
          <div class="flex gap-4 mt-3 border-t border-slate-900 pt-2">
            <button onclick="resolveAssistNode(${req.id}, 'COMPLETE')" class="text-cyan-300 font-bold uppercase hover:underline">[🟢 RESOLVE]</button>
            <button onclick="resolveAssistNode(${req.id}, 'REJECTED')" class="text-pink-300 font-bold uppercase hover:underline">[❌ FLAG_REJECT]</button>
          </div>
        </div>`;
    });
  } else {
    container.innerHTML = `<div class="text-xs text-slate-600 italic">No coordination requests waiting in pipeline.</div>`;
  }
}

async function resolveAssistNode(id, resultStatus) {
  await supabase.from('assistance_requests').update({ status: resultStatus }).eq('id', id);
  await loadAdminAssistRequests();
}

window.addEventListener('DOMContentLoaded', initAdminPanel);
