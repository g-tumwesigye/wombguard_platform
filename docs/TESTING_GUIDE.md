# Testing Guide

Testing the WombGuard application in 3 phases:

---

## Phase 1: Database Verification 

Run these queries in Supabase SQL Editor to verify database setup:

### Query 1: Verify All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```
Should show: audit_logs, chat_history, conversations, predictions, users

### Query 2: Verify All Indexes
```sql
SELECT COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public';
```
Should show: 16

### Query 3: Verify All RLS Policies
```sql
SELECT COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public';
```
Should show: 8

### Query 4: Verify All Triggers
```sql
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```
Should show: 2

---

## Phase 2: Application Startup

### Terminal 1: Start Frontend
```bash
cd Desktop/wombguard_frontend
npm start
```
Should open http://localhost:3000

### Terminal 2: Start Backend
```bash
cd Desktop/wombguard_frontend/wombguard_predictive_api
uvicorn main:app --reload
```
Should start on http://localhost:8000

---

## Phase 3: Functional Testing

### Test 1: User Registration
1. Go to http://localhost:3000
2. Click "Get Started" → "Sign Up"
3. Register with:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Name: `Test User`
   - Role: `Pregnant Woman`
4. Click "Sign Up"

Expected: User created, redirected to dashboard

**Verify in Supabase:**
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

---

### Test 2: User Login
1. Click "Logout"
2. Click "Sign In"
3. Enter credentials
4. Click "Sign In"

Expected: User authenticated, dashboard displayed

---

### Test 3: Health Assessment
1. Go to "Health Assessment"
2. Fill in:
   - Age: 28
   - Systolic BP: 120
   - Diastolic BP: 80
   - Blood Sugar: 100
   - Body Temperature: 98.6
   - BMI: 24
   - Heart Rate: 72
3. Click "Submit Assessment"

Expected: Prediction calculated, risk level displayed

**Verify in Supabase:**
```sql
SELECT * FROM predictions WHERE user_email = 'test@example.com';
```

---

### Test 4: Chatbot
1. Go to "Chat"
2. Type: `Hello, I have questions about pregnancy health`
3. Press Enter

Expected: Bot responds, message saved

**Verify in Supabase:**
```sql
SELECT * FROM chat_history WHERE user_email = 'test@example.com';
```

---

### Test 5: View History
1. Go to "Prediction History"
2. Go to "Chat History"

Expected: Previous data displayed

---

### Test 6: User Profile
1. Click "Profile"
2. Update name
3. Click "Save"

Expected: Profile updated

**Verify in Supabase:**
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

---

### Test 7: Logout
1. Click "Logout"
2. Confirm

Expected: Logged out, redirected to login

---

## Final Verification

Run these queries to verify all data was saved:

```sql
-- Check all users
SELECT COUNT(*) as users FROM users;

-- Check all predictions
SELECT COUNT(*) as predictions FROM predictions;

-- Check all chat messages
SELECT COUNT(*) as chat_messages FROM chat_history;

-- Check all conversations
SELECT COUNT(*) as conversations FROM conversations;

-- Check all audit logs
SELECT COUNT(*) as audit_logs FROM audit_logs;
```

---

## Success Criteria

| Component | Status | Notes |
|-----------|--------|-------|
| Database Tables | Ok | 5 tables created |
| Indexes | Ok | 16 indexes created |
| RLS Policies | Ok | 8 policies created |
| Triggers | Ok | 2 triggers created |
| Frontend Starts | Ok | http://localhost:3000 |
| Backend Starts | Ok | http://localhost:8000 |
| User Registration | Ok | Data saved to DB |
| User Login | Ok | Authentication works |
| Predictions | Ok | ML model works |
| Chatbot | Ok | Chat works |
| History Views | Ok | Data displays |
| Profile Update | Ok | Updates saved |
| Logout | Ok | Session cleared |

---

## Test Summary

**Total Tests:** 13
**Expected Pass Rate:** 100%

If all tests pass:
- Database is working
- Frontend is working
- Backend is working
- Integration is working
- Application is ready 

---
