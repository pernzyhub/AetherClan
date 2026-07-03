// api/register.js - Node Deployment Backend Handler
// Vercel Serverless Function for Supabase User Registration
// Requires environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (use Service Role Key for backend)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * POST /api/register
 * Registers a new user and creates their profile
 * 
 * Request body:
 * {
 *   "username": "string (3+ chars)",
 *   "password": "string (8+ chars)"
 * }
 * 
 * Response: 
 * {
 *   "success": boolean,
 *   "message": string,
 *   "user": { id, character_name, status },
 *   "error": string (only on failure)
 * }
 */
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed. Use POST.',
            received: req.method
        });
    }

    try {
        const { username, password } = req.body;

        // ===== INPUT VALIDATION =====
        if (!username || typeof username !== 'string') {
            return res.status(400).json({ 
                success: false,
                error: 'Username is required and must be a string.'
            });
        }

        if (!password || typeof password !== 'string') {
            return res.status(400).json({ 
                success: false,
                error: 'Password is required and must be a string.'
            });
        }

        const cleanUsername = username.trim().toLowerCase();

        if (cleanUsername.length < 3) {
            return res.status(400).json({ 
                success: false,
                error: 'Username must be at least 3 characters long.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({ 
                success: false,
                error: 'Password must be at least 8 characters long.'
            });
        }

        // Check for valid username format (alphanumeric + underscore/hyphen)
        if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
            return res.status(400).json({ 
                success: false,
                error: 'Username can only contain letters, numbers, underscores, and hyphens.'
            });
        }

        // ===== CREATE SUPABASE AUTH USER =====
        const userEmail = `${cleanUsername}@gmail.com`;

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: userEmail,
            password: password,
            email_confirm: true  // Auto-confirm email (optional)
        });

        if (authError) {
            console.error('Auth creation error:', authError);
            
            if (authError.message?.includes('already exists')) {
                return res.status(409).json({ 
                    success: false,
                    error: 'Username already registered in the system.'
                });
            }
            
            throw authError;
        }

        // ===== CREATE USER PROFILE =====
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authUser.user.id,
                character_name: cleanUsername,
                account_status: 'ACTIVE',
                rolling_7_day_points: 0,
                current_month_points: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id, character_name, account_status')
            .single();

        if (profileError) {
            console.error('Profile creation error:', profileError);
            
            // Cleanup: Delete auth user if profile creation fails
            await supabase.auth.admin.deleteUser(authUser.user.id).catch(err => 
                console.error('Cleanup error:', err)
            );

            return res.status(500).json({ 
                success: false,
                error: 'Failed to create user profile. Please try again.'
            });
        }

        // ===== SUCCESS RESPONSE =====
        return res.status(201).json({ 
            success: true, 
            message: 'Node deployed successfully. Ready for authentication.',
            user: {
                id: profile.id,
                character_name: profile.character_name,
                status: profile.account_status,
                email: userEmail
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        return res.status(500).json({ 
            success: false,
            error: error?.message || 'Internal server error during node deployment'
        });
    }
}
