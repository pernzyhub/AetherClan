// Supabase client initialized from config.js
const supabase = getSupabase();

async function loadEventRankings() {
  const container = document.getElementById('rankings');
  container.innerHTML = '';

  const { data, error } = await supabase
    .from('event_ledgers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    container.innerHTML = '<div class="text-xs text-slate-500">Unable to load event rankings.</div>';
    return;
  }

  container.innerHTML = data.map((e, idx) => `
    <div class="p-4 border border-amber-700 rounded-lg bg-slate-950/80">
      <div class="flex justify-between items-start mb-2">
        <span class="text-amber-400 font-bold">EVENT ${idx + 1}</span>
        <span class="text-cyan-300 font-bold">[+${e.point_valency} pts]</span>
      </div>
      <div class="font-bold text-slate-200 mb-1">${e.event_name}</div>
      <div class="text-xs text-slate-400">ATTENDEES: ${e.attendees ? e.attendees.join(', ') : 'None'}</div>
    </div>
  `).join('');
}

window.addEventListener('DOMContentLoaded', loadEventRankings);
