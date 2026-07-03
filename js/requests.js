const SUPABASE_URL = 'https://mispbaxtkcglpdsjttja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3pwYmF4dGtjZ2xwZHNqdGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzczOTEsImV4cCI6MjA5ODYxMzM5MX0.9YDKOHV1upxigsZSUXkYr_VNSXAc7CXlcCRu9BbIReA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadRequestQueue() {
  const container = document.getElementById('queue');
  container.innerHTML = '';

  const { data, error } = await supabase
    .from('assistance_requests')
    .select('*, profiles(character_name)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true });

  if (error || !data) {
    container.innerHTML = '<div class="text-xs text-slate-500">Unable to load the queue.</div>';
    return;
  }

  container.innerHTML = data.map((r) => `
    <div class="p-4 border border-emerald-700 flex justify-between rounded-lg bg-slate-950/80">
      <div>
        <div class="font-bold text-slate-200">${r.profiles?.character_name || 'UNKNOWN'}</div>
        <div class="text-xs text-slate-400 mt-1">${r.request_details}</div>
      </div>
      <span class="text-emerald-300 font-bold text-xs">${r.status}</span>
    </div>
  `).join('');
}

window.addEventListener('DOMContentLoaded', loadRequestQueue);
