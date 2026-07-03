const SUPABASE_URL = 'https://mispbaxtkcglpdsjttja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3pwYmF4dGtjZ2xwZHNqdGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzczOTEsImV4cCI6MjA5ODYxMzM5MX0.9YDKOHV1upxigsZSUXkYr_VNSXAc7CXlcCRu9BbIReA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
