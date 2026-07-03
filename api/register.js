// api/register.js - Node Deployment Backend Handler
// Handles user registration with secure password hashing
// Requires Node.js environment with Supabase credentials

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Initialize Supabase using environment variables
// Set these in your hosting platform (Vercel, etc.)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/register
 * Body: { username, password }
 * Response: { success: boolean, message: string, error?: string }
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            details: `Received ${req.method}, expected POST`
        });
    }

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Username and password are required.',
            received: { username: !!username, password: !!password }
        });
    }

    // Additional validation
    if (username.length < 3) {
        return res.status(400).json({ 
            error: 'Username must be at least 3 characters long.'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({ 
            error: 'Password must be at least 8 characters long.'
        });
    }

    try {
        // 1. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Create Supabase auth user with email format
        const userEmail = `${username.toLowerCase()}@aetherclan.local`;
        
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: userEmail,
            password: password,
            email_confirm: true
        });

        if (authError) {
            // Handle specific errors
            if (authError.message.includes('already exists')) {
                return res.status(400).json({ 
                    error: 'Username already deployment-registered.'
                });
            }
            throw authError;
        }

        // 3. Insert user profile into profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: authUser.user.id,
                    character_name: username.toLowerCase().trim(),
                    account_status: 'ACTIVE',
                    rolling_7_day_points: 0,
                    current_month_points: 0,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (profileError) {
            // If profile creation fails, try to clean up the auth user
            await supabase.auth.admin.deleteUser(authUser.user.id);
            throw profileError;
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Node deployed to database successfully.',
            node: {
                id: profile.id,
                character_name: profile.character_name,
                status: profile.account_status
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ 
            error: err.message || 'Internal server error during node deployment'
        });
    }
}
