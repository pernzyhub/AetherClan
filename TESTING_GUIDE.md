# 🧪 AetherClan Testing Guide

## ✅ Pre-Test Checklist

- [x] Supabase URL configured: `https://miszpbaxtkcglpdsjtja.supabase.co`
- [x] Frontend key (Anonymous) added
- [x] Backend key (Service Role) added
- [x] Config.js updated
- [x] HTML files load scripts in correct order

---

## 🚀 Test Setup

### **Step 1: Open in Browser**
```
Open: http://localhost:8000 (or where you're serving the files)
Page: index.html
```

### **Step 2: Check Browser Console**
Press `F12` → Console tab → Look for:
```
✅ NO RED ERRORS
✅ Supabase client initialized
```

---

## 🧪 Test Cases

### **Test 1: Superadmin Login (Bypass)**
**Purpose:** Verify login form works
**Expected:** Should load dashboard without Supabase verification

Steps:
1. Go to index.html
2. Character Name: `superadmin`
3. Passkey: `admin`
4. Click "INITIALIZE_AUTH"
5. ✅ Should redirect to dashboard.html
6. ✅ Should show "AUTHENTICATED_NODE // SUPERADMIN"

---

### **Test 2: Create Test User (Admin Panel)**
**Purpose:** Test user registration via admin panel
**Prerequisites:** Must be logged in as superadmin

Steps:
1. From dashboard, click "ADMIN_PANEL.sys"
2. Input: `pernzy, Password123!`
3. Click "INITIALIZE_NODE_DEPLOYMENT"
4. ✅ Should show "✅ SUCCESS: Node [pernzy] registered"

---

### **Test 3: Login as New User**
**Purpose:** Verify registered user can login
**Prerequisites:** Test 2 completed successfully

Steps:
1. Logout (DISCONNECT button)
2. Go back to index.html
3. Character Name: `pernzy`
4. Passkey: `Password123!`
5. Click "INITIALIZE_AUTH"
6. ✅ Should redirect to dashboard
7. ✅ Should show "AUTHENTICATED_NODE // PERNZY"

---

### **Test 4: Dashboard Tabs**
**Purpose:** Verify all dashboard sections load
**Prerequisites:** Logged in as any user

Steps:
1. Click "ROSTER.sys" tab → ✅ Should show user roster
2. Click "ASSIST.sys" tab → ✅ Should show empty or existing requests
3. Click "EVENT_LEDGER.sys" tab → ✅ Should show empty or existing events

---

### **Test 5: Invalid Login**
**Purpose:** Test error handling
**Prerequisites:** None

Steps:
1. Go to index.html
2. Character Name: `invalid_user`
3. Passkey: `wrongpassword`
4. Click "INITIALIZE_AUTH"
5. ✅ Should show error banner: "Character node not found"

---

### **Test 6: Password Reset Form**
**Purpose:** Test form toggle
**Prerequisites:** None

Steps:
1. Go to index.html
2. Click "LOST_ACCESS?" link
3. ✅ Login form should hide
4. ✅ Reset form should show
5. Click back → ✅ Reset form should hide

---

## 📊 Supabase Verification

### Check These in Supabase Dashboard:

**1. Tables Exist:**
- [ ] `profiles` table
- [ ] `assistance_requests` table
- [ ] `event_ledgers` table

**2. Sample Data:**
```sql
SELECT * FROM profiles;
SELECT * FROM assistance_requests;
SELECT * FROM event_ledgers;
```

**3. Row-Level Security (RLS):**
- [ ] Check if RLS is enabled on tables
- [ ] If enabled, verify policies allow:
  - Anonymous key to read profiles
  - Service role to insert/update users

---

## 🐛 Troubleshooting

### **Error: "Character node not found"**
- ✅ Expected for non-existent users
- ❌ If superadmin fails: Check database connection

### **Error: "Authentication failed"**
- Check password is correct
- Verify user exists in database
- Check Supabase Auth has the user

### **Error: "Supabase library not loaded"**
- Verify Supabase CDN script loads first in HTML
- Check browser network tab for script loading

### **Admin panel doesn't create user**
- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Verify backend API can access Supabase
- Check browser console for error details

### **Dashboard won't load**
- Verify you're logged in
- Check `profiles` table has user record
- Look for errors in browser console

---

## 📋 Expected Console Logs

When page loads, you should see:
```
✅ Supabase initialized
✅ Config loaded
✅ Utils functions available
```

When logging in:
```
✅ Fetching profile...
✅ Authentication success
✅ Loading roster...
✅ Dashboard ready
```

---

## 🎯 Full Test Workflow

1. ✅ Open index.html
2. ✅ Login with superadmin/admin
3. ✅ View dashboard
4. ✅ Go to Admin Panel
5. ✅ Create test user (pernzy)
6. ✅ Logout
7. ✅ Login with new user credentials
8. ✅ View user dashboard
9. ✅ Check all tabs load correctly
10. ✅ Test invalid login
11. ✅ Verify error messages display

---

## ✅ Success Criteria

All tests pass when:
- ✅ Superadmin login works
- ✅ User registration works
- ✅ New user can login
- ✅ Dashboard displays correctly
- ✅ All tabs are accessible
- ✅ Logout works
- ✅ Error messages display
- ✅ No console errors
- ✅ Supabase connection confirmed

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Test 1 (Superadmin): PASS / FAIL ___________
Test 2 (Create User): PASS / FAIL ___________
Test 3 (Login New User): PASS / FAIL ___________
Test 4 (Dashboard Tabs): PASS / FAIL ___________
Test 5 (Invalid Login): PASS / FAIL ___________
Test 6 (Password Reset): PASS / FAIL ___________

Console Errors: NONE / YES ___________
Supabase Connected: YES / NO ___________

Notes:
_________________________________________________________________
_________________________________________________________________
```

---

## 🚀 Ready to Test!

1. **Open terminal and start a local server:**
   ```bash
   cd /workspaces/AetherClan
   python3 -m http.server 8000
   # or use any other local server
   ```

2. **Open browser:**
   ```
   http://localhost:8000
   ```

3. **Follow Test Workflow above**

4. **Report any issues with screenshots of:**
   - Error messages
   - Browser console (F12 → Console)
   - Supabase dashboard status

---

**Happy Testing! 🎉**
