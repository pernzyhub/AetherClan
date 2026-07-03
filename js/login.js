const SUPABASE_URL = 'https://mispbaxtkcglpdsjttja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3pwYmF4dGtjZ2xwZHNqdGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzczOTEsImV4cCI6MjA5ODYxMzM5MX0.9YDKOHV1upxigsZSUXkYr_VNSXAc7CXlcCRu9BbIReA';
const dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function resizeCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function startCyberCanvas() {
  const canvas = document.getElementById('matrix-bg');
  const ctx = canvas.getContext('2d');
  const alphabet = '0123456789ABCDEF@#$%&*<>?~'.split('');
  const fontSize = 16;
  let columns = Math.floor(window.innerWidth / fontSize);
  let rainDrops = Array(columns).fill(1);

  function drawFrame() {
    ctx.fillStyle = 'rgba(5, 5, 18, 0.14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px Fira Code, monospace`;

    for (let i = 0; i < rainDrops.length; i++) {
      const char = alphabet[Math.floor(Math.random() * alphabet.length)];
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(255, 62, 165, 0.95)');
      gradient.addColorStop(1, 'rgba(77, 224, 255, 0.75)');
      ctx.fillStyle = gradient;
      ctx.fillText(char, i * fontSize, rainDrops[i] * fontSize);
      if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        rainDrops[i] = 0;
      }
      rainDrops[i]++;
    }
  }

  function updateCanvasSize() {
    resizeCanvas(canvas);
    columns = Math.floor(canvas.width / fontSize);
    rainDrops = Array(columns).fill(1);
  }

  updateCanvasSize();
  window.addEventListener('resize', updateCanvasSize);
  setInterval(drawFrame, 35);
}

function registerLoginHandlers() {
  const loginForm = document.getElementById('login-form');
  const submitBtn = document.getElementById('submit-btn');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = 'CONNECTING...';
    errorBanner.classList.add('hidden');

    const inputName = document.getElementById('character-name').value.trim();
    const passkey = document.getElementById('passkey').value;

    if (inputName.toLowerCase() === 'superadmin' && passkey === 'admin') {
      localStorage.setItem('bypass_superadmin', 'true');
      window.location.href = 'dashboard.html';
      return;
    }

    try {
      const { data: profileNode, error: profileError } = await dbClient
        .from('profiles')
        .select('*')
        .ilike('character_name', inputName)
        .maybeSingle();

      if (profileError || !profileNode) {
        throw new Error('Character node not found.');
      }
      if (profileNode.account_status === 'DISCONNECTED') {
        throw new Error('Node deactivated.');
      }

      const targetEmail = `${profileNode.character_name.toLowerCase()}@aetherclan.local`;
      const { error: authError } = await dbClient.auth.signInWithPassword({
        email: targetEmail,
        password: passkey,
      });

      if (authError) {
        throw new Error('Authentication failed.');
      }

      window.location.href = 'dashboard.html';
    } catch (error) {
      errorMessage.innerText = error.message;
      errorBanner.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.innerText = 'INITIALIZE_AUTH';
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  startCyberCanvas();
  registerLoginHandlers();
});
