const SUPABASE_URL = 'https://mispbaxtkcglpdsjttja.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadEventRankings() {
  const container = document.getElementById('rankings');
  container.innerHTML = '';

  const { data, error } = await supabase
    .from('event_history')
    .select('*')
    .order('rank', { ascending: true });

  if (error || !data) {
    container.innerHTML = '<div class="text-xs text-slate-500">Unable to load event rankings.</div>';
    return;
  }

  container.innerHTML = data.map((e) => `
    <div class="p-4 border border-slate-700 rounded-lg bg-slate-950/80">
      <span class="text-amber-400 font-bold">RANK ${e.rank}:</span> ${e.event_name} <span class="text-slate-400">- Winner: ${e.winner_name}</span>
    </div>
  `).join('');
}

window.addEventListener('DOMContentLoaded', loadEventRankings);
