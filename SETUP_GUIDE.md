# AetherClan Admin Panel - Setup & Integration Guide

## Overview
AetherClan is a cyberpunk-themed admin panel for managing team rosters, events, and assistance requests using Supabase as the backend.

## Files Updated

### ✅ Configuration Files (NEW)
- `js/config.js` - Centralized Supabase configuration
- `js/utils.js` - Shared utility functions
- `api/register.js` - Backend registration endpoint

### ✅ JavaScript Files (UPDATED)
- `js/login.js` - Uses shared Supabase config
- `js/dashboard.js` - Uses shared Supabase config + has complete functions
- `js/rankings.js` - Uses shared Supabase config
- `js/requests.js` - Uses shared Supabase config
- `js/admin.js` - Enhanced with additional admin controls (moved from api/)

### ✅ HTML Files (UPDATED)
All HTML files now load in this order:
1. Supabase library (CDN)
2. `config.js` - Initialize client
3. `utils.js` - Shared utilities
4. Page-specific CSS & JS

Updated files:
- index.html
- dashboard.html
- admin-panel.html
- rankings.html
- requests.html
- ledger.html
- assist.html

## Environment Setup

### For Local Development

Create a `.env.local` file in your project root:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### For Vercel/Netlify Deployment

1. Go to your hosting provider's dashboard
2. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Key Features Implemented

### 1. Centralized Configuration (`js/config.js`)
- Eliminates duplicate Supabase initialization
- Easy to update API keys in one place
- Supports environment variables
- Single source of truth for client setup

### 2. Enhanced Admin Panel (`js/admin.js`)
Functions:
- `setupAdminControls()` - Initialize admin event listeners
- `deactivateNode(nodeId)` - Deactivate user account
- `activateNode(nodeId)` - Reactivate user account
- `adjustNodePoints(nodeId)` - Add/subtract points

### 3. Utility Functions (`js/utils.js`)
- `formatDate()` - Consistent date formatting
- `showNotification()` - Toast notifications
- `isAuthenticated()` - Check login status
- `getCurrentUserProfile()` - Fetch current user
- `logout()` - Secure logout
- `isValidEmail()` - Email validation
- `debounce()` - Function debouncing
- `copyToClipboard()` - Copy text utility

### 4. Improved Registration (`api/register.js`)
- Enhanced validation (username & password length)
- Proper error handling
- User profile creation on registration
- Automatic cleanup on failure
- Better error messages

## Database Schema Requirements

### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  character_name VARCHAR(255) UNIQUE NOT NULL,
  account_status VARCHAR(50) DEFAULT 'ACTIVE',
  rolling_7_day_points INT DEFAULT 0,
  current_month_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### assistance_requests table
```sql
CREATE TABLE assistance_requests (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  request_details TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### event_ledgers table
```sql
CREATE TABLE event_ledgers (
  id UUID PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  point_valency INT DEFAULT 0,
  attendees TEXT[] DEFAULT ARRAY[]::TEXT[],
  screenshot_url VARCHAR(500),
  time_stamp_target VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Best Practices

⚠️ **Important:**
1. Enable Row-Level Security (RLS) in Supabase
2. Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
3. Keep admin credentials secure
4. Use environment variables for sensitive data
5. Implement proper authentication checks
6. Add CORS restrictions for API endpoints

## Testing Checklist

- [ ] Config loads without errors
- [ ] Supabase client initializes correctly
- [ ] Login works with existing users
- [ ] Registration creates new users
- [ ] Admin panel accessible to authorized users
- [ ] Dashboard displays user data
- [ ] Rankings and requests load correctly
- [ ] Notifications display properly
- [ ] Logout clears session
- [ ] API errors handled gracefully

## Troubleshooting

### "Supabase library not loaded" error
- Ensure `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` is in HTML head
- Check browser console for loading errors

### Authentication failing
- Verify Supabase URL and keys are correct
- Check that user email format matches `${username}@aetherclan.local`
- Ensure user exists in `profiles` table

### Registration errors
- Check `SUPABASE_SERVICE_ROLE_KEY` is set in backend
- Verify username isn't already taken
- Confirm password meets minimum length (8 characters)

### Points not updating
- Verify user has proper profile in database
- Check Supabase RLS policies allow updates
- Ensure user ID matches in request

## Performance Optimization

✅ Completed:
- Eliminated duplicate code
- Centralized configuration
- Shared utility functions
- Async/await for better flow control

Recommended:
- Add caching for frequently accessed data
- Implement pagination for large lists
- Use indexes on frequently queried columns
- Add loading states for long operations

## Future Enhancements

- [ ] Real-time data updates with Supabase subscriptions
- [ ] Advanced filtering and search
- [ ] Export data to CSV
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Activity logging
- [ ] Bulk operations
- [ ] Advanced analytics

---

**Last Updated:** 2026-07-03
**Version:** 1.1.0
