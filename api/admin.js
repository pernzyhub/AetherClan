// js/admin.js

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

            // For this example, assuming registration format is "Username, Password"
            // or modify your UI to have a separate password field!
            const parts = inputValue.split(',');
            const username = parts[0]?.trim();
            const password = parts[1]?.trim() || "DefaultClanPassword123!"; // Fallback fallback if they only type a name

            deployBtn.innerText = 'DEPLOYING_NODE...';
            deployBtn.disabled = true;

            try {
                // Send payload to Vercel's serverless function
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
                    bulkInput.value = ''; // clear input
                } else {
                    alert(`❌ DEPLOYMENT FAILED: ${result.error}`);
                }

            } catch (error) {
                console.error(error);
                alert('🚨 CRITICAL: Network error during deployment sequence.');
            } finally {
                deployBtn.innerText = 'INITIALIZE_NODE_DEPLOYMENT';
                deployBtn.disabled = false;
            }
        });
    }
});