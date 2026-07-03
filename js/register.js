// api/register.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Initializes Supabase using environment variables set up in your Vercel dashboard
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // 1. Hash the password securely so it's never stored in plain text
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Insert user data directly into your custom database table
        const { data, error } = await supabase
            .from('custom_users')
            .insert([
                { 
                    username: username.trim(), 
                    password_hash: hashedPassword 
                }
            ]);

        if (error) {
            // Handle duplicate usernames (violating the UNIQUE constraint)
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Username already deployment-registered.' });
            }
            throw error;
        }

        return res.status(200).json({ success: true, message: 'Node deployed to database successfully.' });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}