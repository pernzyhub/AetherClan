const SUPABASE_URL = 'https://mispbaxtkcglpdsjttja.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadRequestQueue() {
  const container = document.getElementById('queue');
  container.innerHTML = '';

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('quantity', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data) {
    container.innerHTML = '<div class="text-xs text-slate-500">Unable to load the queue.</div>';
    return;
  }

  container.innerHTML = data.map((r) => `
    <div class="p-4 border border-slate-700 flex justify-between rounded-lg bg-slate-950/80">
      <span>${r.item_name} <span class="text-slate-500">(Qty: ${r.quantity})</span></span>
      <span class="text-cyan-300 font-bold">${r.character_name}</span>
    </div>
  `).join('');
}

window.addEventListener('DOMContentLoaded', loadRequestQueue);
