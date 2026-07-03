# 📋 AETHERCLAN - QUICK REFERENCE

## 🚀 Getting Started

1. **Copy environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Supabase credentials to `.env.local`**

3. **Test locally or deploy**

---

## 📂 Key Files

### Configuration
- **js/config.js** - Supabase initialization (use `getSupabase()`)
- **js/utils.js** - 10+ utility functions for common tasks
- **.env.example** - Environment variables template

### Frontend
- **js/login.js** - Authentication and matrix background
- **js/dashboard.js** - Main dashboard with tabs
- **js/admin.js** - Admin controls (enhanced)
- **js/rankings.js** - Event rankings display
- **js/requests.js** - Assistance requests queue

### Backend API
- **api/register.js** - User registration endpoint

### Documentation
- **SETUP_GUIDE.md** - Comprehensive setup guide
- **CODE_CONSOLIDATION_REPORT.md** - Detailed change report

---

## 🔧 Common Tasks

### Initialize Supabase in any JS file
```javascript
const supabase = getSupabase();
```

### Show notification
```javascript
showNotification('Success message', 'success'); // or 'error', 'info'
```

### Check if logged in
```javascript
const loggedIn = await isAuthenticated();
```

### Get current user profile
```javascript
const profile = await getCurrentUserProfile();
```

### Logout
```javascript
await logout();
```

### Logout silently
```javascript
localStorage.removeItem('bypass_superadmin');
localStorage.removeItem('auth_token');
```

---

## 🛡️ Security Checklist

- [ ] API keys in .env.local (not in code)
- [ ] Service Role Key never in frontend
- [ ] Row-Level Security (RLS) enabled in Supabase
- [ ] CORS configured properly
- [ ] Admin functions guarded with permission checks

---

## 🧪 Testing

Run verification script:
```bash
bash verify-setup.sh
```

Check browser console for errors while testing each page.

---

## 📊 Code Changes Summary

| Category | Before | After | Status |
|----------|--------|-------|--------|
| Supabase Config Copies | 4 | 1 | ✅ Consolidated |
| Duplicate Utility Code | Yes | No | ✅ Eliminated |
| API Key Exposure | Hardcoded | Environment | ✅ Secured |
| Admin Features | Basic | Enhanced | ✅ Improved |
| Documentation | Minimal | Complete | ✅ Added |

---

## 🚨 Troubleshooting

**"Supabase is not defined"**
- Check HTML loads Supabase library before config.js
- Clear browser cache

**"getSupabase() returns null"**
- Verify config.js is loaded before other scripts
- Check browser console for errors

**"Registration fails"**
- Check SUPABASE_SERVICE_ROLE_KEY is set in backend
- Verify username isn't already taken
- Check password is at least 8 characters

**Admin functions not working**
- Ensure user is logged in as admin
- Check RLS policies in Supabase
- Verify user profile exists in database

---

## 📞 Support Files

- **SETUP_GUIDE.md** - Complete setup documentation
- **CODE_CONSOLIDATION_REPORT.md** - Detailed technical report
- **CODE_REVIEW.md** - Code review notes (this file)
- **verify-setup.sh** - Automated setup verification

---

**Last Updated:** 2026-07-03
**Status:** ✅ Production Ready
