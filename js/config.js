// Shared Supabase Configuration
// To use environment variables, set these in your hosting platform (Vercel, etc.)
// Or update these values directly

const CONFIG = {
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://mispbaxtkcglpdsjttja.supabase.co',
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3pwYmF4dGtjZ2xwZHNqdGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzczOTEsImV4cCI6MjA5ODYxMzM5MX0.9YDKOHV1upxigsZSUXkYr_VNSXAc7CXlcCRu9BbIReA'
};

// Initialize Supabase client
let supabase = null;

function initSupabase() {
  if (!window.supabase) {
    console.error('Supabase library not loaded. Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    return null;
  }
  
  if (!supabase) {
    supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }
  
  return supabase;
}

// Get or create Supabase client
function getSupabase() {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
}

// Security Note: 
// ⚠️ API keys are visible in browser code. This is normal for anonymous keys.
// ⚠️ Set Row-Level Security (RLS) in Supabase to restrict data access
// ⚠️ Never expose service role keys in frontend code
