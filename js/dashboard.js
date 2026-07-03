const SUPABASE_URL = 'https://mispbaxtkcglpdsjttja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3pwYmF4dGtjZ2xwZHNqdGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzczOTEsImV4cCI6MjA5ODYxMzM5MX0.9YDKOHV1upxigsZSUXkYr_VNSXAc7CXlcCRu9BbIReA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUserProfile = null;

async function initDashboard() {
  const tabButtons = document.querySelectorAll('[data-tab-target]');
  const logoutBtn = document.getElementById('logout-btn');

  tabButtons.forEach((button) => button.addEventListener('click', handleTabClick));
  logoutBtn?.addEventListener('click', handleLogout);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    if (localStorage.getItem('bypass_superadmin') === 'true') {
      currentUserProfile = {
        character_name: 'superadmin',
        rolling_7_day_points: 0,
        current_month_points: 0,
      };
      document.getElementById('user-status-display').innerText = 'AUTHENTICATED_NODE // SUPERADMIN';
      document.getElementById('my-name').innerText = 'superadmin';
      document.getElementById('my-7day-points').innerText = '0';
      document.getElementById('my-month-points').innerText = '0';
      document.getElementById('admin-nav-btn').classList.remove('hidden');

      await loadGlobalRosterStream();
      await loadLiveOperationalPipeline();
      await loadArchivedEventLedgers();
      document.getElementById('assistance-form').addEventListener('submit', handleAssistanceSubmit);
      switchTab('roster');
      return;
    }

    window.location.href = 'index.html';
    return;
  }

  const characterNameHandle = session.user.email.split('@')[0];
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('character_name', characterNameHandle)
    .single();

  if (error || !profile || profile.account_status === 'DISCONNECTED') {
    alert('NODE ERROR: Account registration trace missing or node status deactivated.');
    await supabase.auth.signOut();
    window.location.href = 'index.html';
    return;
  }

  currentUserProfile = profile;
  document.getElementById('user-status-display').innerText = `AUTHENTICATED_NODE // ${profile.character_name.toUpperCase()}`;
  document.getElementById('my-name').innerText = profile.character_name;
  document.getElementById('my-7day-points').innerText = profile.rolling_7_day_points;
  document.getElementById('my-month-points').innerText = profile.current_month_points;

  if (profile.character_name.toLowerCase() === 'pernzy') {
    document.getElementById('admin-nav-btn').classList.remove('hidden');
  }

  await loadGlobalRosterStream();
  await loadLiveOperationalPipeline();
  await loadArchivedEventLedgers();
  document.getElementById('assistance-form').addEventListener('submit', handleAssistanceSubmit);
  switchTab('roster');
}

function handleTabClick(event) {
  const target = event.currentTarget.dataset.tabTarget;
  switchTab(target);
}

function switchTab(targetTabId) {
  document.querySelectorAll('.tab-content').forEach((content) => content.classList.add('hidden'));
  document.getElementById(`tab-${targetTabId}`).classList.remove('hidden');

  document.querySelectorAll('[data-tab-target]').forEach((button) => {
    button.classList.remove('bg-emerald-950/40', 'text-emerald-400', 'border-emerald-500/40');
    button.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
  });

  const activeButton = document.querySelector(`[data-tab-target='${targetTabId}']`);
  if (activeButton) {
    activeButton.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
    activeButton.classList.add('bg-emerald-950/40', 'text-emerald-400', 'border-emerald-500/40');
  }
}

function handleLogout() {
  localStorage.removeItem('bypass_superadmin');
  supabase.auth.signOut().then(() => {
    window.location.href = 'index.html';
  });
}

async function loadGlobalRosterStream() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('account_status', 'ACTIVE')
    .order('current_month_points', { ascending: false });

  const tbody = document.getElementById('global-roster-rows');
  tbody.innerHTML = '';

  if (error || !data) {
    tbody.innerHTML = `<tr><td colspan="3" class="py-4 text-xs text-slate-500">Unable to load the roster stream.</td></tr>`;
    return;
  }

  data.forEach((profile, index) => {
    tbody.innerHTML += `
      <tr class="border-b border-slate-900/20 hover:bg-slate-900/10 transition-colors">
        <td class="py-2.5 font-bold text-slate-200">
          <span class="text-[10px] text-slate-600 mr-2">#${index + 1}</span>${profile.character_name}
        </td>
        <td class="py-2.5 text-center font-medium text-cyan-300">${profile.rolling_7_day_points}</td>
        <td class="py-2.5 text-right text-pink-400 font-bold">${profile.current_month_points} pts</td>
      </tr>`;
  });
}

async function handleAssistanceSubmit(event) {
  event.preventDefault();
  const detailsText = document.getElementById('assist-details').value.trim();

  if (!detailsText) {
    return;
  }

  const { error } = await supabase.from('assistance_requests').insert({
    profile_id: currentUserProfile.id,
    request_details: detailsText,
    status: 'PENDING',
  });

  if (!error) {
    document.getElementById('assist-details').value = '';
    await loadLiveOperationalPipeline();
  } else {
    alert('DISPATCH ERROR: Transmission pipeline blocked.');
  }
}

async function loadLiveOperationalPipeline() {
  const { data } = await supabase
    .from('assistance_requests')
    .select('*, profiles(character_name)')
    .order('created_at', { ascending: false });

  const container = document.getElementById('assist-feed-container');
  container.innerHTML = '';

  if (data && data.length) {
    data.forEach((req) => {
      let badgeColor = 'border-amber-500/30 text-amber-400 bg-amber-950/20';
      if (req.status === 'COMPLETE') badgeColor = 'border-cyan-500/30 text-cyan-300 bg-slate-950/20';
      if (req.status === 'REJECTED') badgeColor = 'border-pink-500/30 text-pink-300 bg-slate-950/20';

      container.innerHTML += `
        <div class="p-4 bg-slate-900/30 border border-slate-900 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-300">${req.profiles?.character_name || 'UNKNOWN_NODE'}</span>
              <span class="text-[9px] text-slate-600">${new Date(req.created_at).toLocaleDateString()}</span>
            </div>
            <p class="text-slate-400">${req.request_details}</p>
          </div>
          <span class="px-2 py-0.5 border font-bold text-[9px] uppercase tracking-wider rounded ${badgeColor}">${req.status}</span>
        </div>`;
    });
  } else {
    container.innerHTML = `<div class="text-xs text-slate-600 italic">No communications broad-cast active in regional matrix grid.</div>`;
  }
}

async function loadArchivedEventLedgers() {
  const { data } = await supabase
    .from('event_ledgers')
    .select('*')
    .order('created_at', { ascending: false });

  const container = document.getElementById('ledger-feed-container');
  container.innerHTML = '';

  if (data && data.length) {
    data.forEach((event) => {
      const inlineAttendees = event.attendees ? event.attendees.join(', ') : 'None';
      container.innerHTML += `
        <div class="p-4 bg-slate-900/30 border border-slate-900 rounded flex flex-col justify-between space-y-4 text-xs">
          <div>
            <div class="flex justify-between font-bold border-b border-slate-900 pb-1.5 mb-2">
              <span class="text-slate-200 uppercase">${event.event_name}</span>
              <span class="text-cyan-300">[+${event.point_valency} Pts]</span>
            </div>
            <div class="text-[10px] text-slate-500 mb-2 font-semibold">TIMESTAMP: ${event.time_stamp_target || 'N/A'}</div>
            <div class="text-slate-400 text-[11px]"><span class="font-bold text-slate-500">ATTENDEES:</span> ${inlineAttendees}</div>
          </div>
          ${event.screenshot_url ? `
            <a href="${event.screenshot_url}" target="_blank" class="block w-full border border-slate-800 rounded bg-slate-950/40 p-2 text-center text-[10px] font-bold text-cyan-300/90 hover:text-cyan-200 hover:border-cyan-500/30 transition-all">
              🖼️ VIEW_IMAGE_PROOF_RECEIPT ↗
            </a>` : ''}
        </div>`;
    });
  } else {
    container.innerHTML = `<div class="col-span-full text-xs text-slate-600 italic">No past event ledgers compiled inside cloud index storage units.</div>`;
  }
}

window.addEventListener('DOMContentLoaded', initDashboard);
