// Utility Functions for AetherClan Admin Panel

/**
 * Format date in a readable way
 * @param {string|Date} date 
 * @returns {string}
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show notification toast
 * @param {string} message
 * @param {string} type - 'success', 'error', 'info'
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style based on type
    const baseClass = 'fixed bottom-4 right-4 p-4 rounded border text-sm font-bold max-w-md z-50';
    const typeClass = {
        success: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400',
        error: 'bg-pink-950/40 border-pink-500/40 text-pink-300',
        info: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
    }[type] || typeClass.info;
    
    notification.className = `${baseClass} ${typeClass}`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

/**
 * Check if user is logged in
 * @returns {Promise<boolean>}
 */
async function isAuthenticated() {
    const supabase = getSupabase();
    if (!supabase) return false;
    
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

/**
 * Get current user profile
 * @returns {Promise<object|null>}
 */
async function getCurrentUserProfile() {
    const supabase = getSupabase();
    if (!supabase) return null;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    return profile;
}

/**
 * Logout and redirect
 */
async function logout() {
    const supabase = getSupabase();
    if (supabase) {
        await supabase.auth.signOut();
    }
    localStorage.removeItem('bypass_superadmin');
    localStorage.removeItem('auth_token');
    window.location.href = 'index.html';
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Debounce function for search inputs
 * @param {function} func
 * @param {number} delay
 * @returns {function}
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}
