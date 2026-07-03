// api/register.js - Updated Node Deployment Endpoint
// This file has been moved to support the frontend admin panel
// The main implementation is now in js/admin.js
// 
// This API route should be hosted on your backend (Vercel, Express, etc.)
// See register.js for the actual backend implementation

export default async function handler(req, res) {
    return res.status(200).json({ 
        message: 'Use register.js endpoint for node deployment',
        endpoint: '/api/register'
    });
}
