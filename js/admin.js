// Admin Panel Controls - AetherClan Node Deployment System
// Requires: config.js to be loaded first

const supabase = getSupabase();

document.addEventListener('DOMContentLoaded', () => {
    const deployBtn = document.getElementById('deploy-nodes-btn');
    const bulkInput = document.getElementById('bulk-roster-input');

    if (deployBtn) {
        deployBtn.addEventListener('click', async () => {
            const inputValue = bulkInput.value.trim();
            
            if (!inputValue) {
                alert('🚨 ERROR: Input stream empty. Enter a node name.');
                return;
            }

            // Parse input format: "Username, Password" or just "Username"
            const parts = inputValue.split(',');
            const username = parts[0]?.trim();
            const password = parts[1]?.trim() || "DefaultClanPassword123!";

            if (!username) {
                alert('🚨 ERROR: Invalid node name format.');
                return;
            }

            deployBtn.innerText = 'DEPLOYING_NODE...';
            deployBtn.disabled = true;

            try {
                // Call the backend API endpoint
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok) {
                    alert(`✅ SUCCESS: Node [${username}] registered directly to database core.`);
                    bulkInput.value = '';
                    
                    // Also log to dashboard
                    console.log(`Node deployed: ${username}`);
                } else {
                    alert(`❌ DEPLOYMENT FAILED: ${result.error || 'Unknown error'}`);
                }

            } catch (error) {
                console.error('Deployment error:', error);
                alert('🚨 CRITICAL: Network error during deployment sequence.');
            } finally {
                deployBtn.innerText = 'INITIALIZE_NODE_DEPLOYMENT';
                deployBtn.disabled = false;
            }
        });
    }

    // Additional Admin Functions
    setupAdminControls();
});

/**
 * Setup additional admin control listeners
 */
function setupAdminControls() {
    const adminActions = document.querySelectorAll('[data-admin-action]');
    
    adminActions.forEach(element => {
        element.addEventListener('click', async (e) => {
            const action = e.target.dataset.adminAction;
            const targetId = e.target.dataset.targetId;
            
            switch(action) {
                case 'deactivate-node':
                    await deactivateNode(targetId);
                    break;
                case 'activate-node':
                    await activateNode(targetId);
                    break;
                case 'adjust-points':
                    await adjustNodePoints(targetId);
                    break;
                default:
                    console.warn('Unknown admin action:', action);
            }
        });
    });
}

/**
 * Deactivate a user node
 */
async function deactivateNode(nodeId) {
    if (!confirm('Deactivate this node? This action can be reversed.')) return;
    
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ account_status: 'DISCONNECTED' })
            .eq('id', nodeId);
        
        if (error) throw error;
        alert('✅ Node deactivated successfully.');
        location.reload();
    } catch (error) {
        console.error('Deactivation error:', error);
        alert('❌ Failed to deactivate node.');
    }
}

/**
 * Activate a user node
 */
async function activateNode(nodeId) {
    if (!confirm('Activate this node? User will regain access.')) return;
    
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ account_status: 'ACTIVE' })
            .eq('id', nodeId);
        
        if (error) throw error;
        alert('✅ Node activated successfully.');
        location.reload();
    } catch (error) {
        console.error('Activation error:', error);
        alert('❌ Failed to activate node.');
    }
}

/**
 * Adjust points for a node
 */
async function adjustNodePoints(nodeId) {
    const points = prompt('Enter points to add (use negative numbers to subtract):');
    if (points === null) return;
    
    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum)) {
        alert('❌ Invalid points value.');
        return;
    }
    
    try {
        // Get current profile
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('current_month_points')
            .eq('id', nodeId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const newPoints = Math.max(0, (profile.current_month_points || 0) + pointsNum);
        
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ current_month_points: newPoints })
            .eq('id', nodeId);
        
        if (updateError) throw updateError;
        alert(`✅ Points adjusted. New total: ${newPoints}`);
        location.reload();
    } catch (error) {
        console.error('Points adjustment error:', error);
        alert('❌ Failed to adjust points.');
    }
}
