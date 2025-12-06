# Signup Network Error Diagnosis Guide

## Current Setup Status
✅ Server running on: http://localhost:5000
✅ Client running on: http://localhost:5174
✅ CORS configured for port 5174
✅ Database connected
✅ Enhanced logging enabled

## Steps to Diagnose the Issue

### 1. Open Browser Developer Tools
- Open http://localhost:5174 in your browser
- Press F12 to open Developer Tools
- Go to the "Console" tab

### 2. Try to Sign Up
- Click on "Sign Up" button
- Fill in the form:
  - Name: Test User
  - Email: test123@example.com
  - Password: password123
  - Role: Security Analyst
- Click "Sign Up"

### 3. Check the Console Output
Look for these log messages in the browser console:
```
Attempting signup with: {name: "...", email: "...", role: "..."}
API URL: http://localhost:5000/api/auth/signup
Response status: ...
Response ok: ...
Response data: ...
```

### 4. Check for Errors
If you see an error, note:
- The error message
- The error type (TypeError, NetworkError, etc.)
- Any CORS-related messages

### 5. Check Server Logs
In the terminal where the server is running, you should see:
```
2025-12-06T... - POST /api/auth/signup
Request body: { name: '...', email: '...', password: '...', role: '...' }
```

## Common Issues and Solutions

### Issue 1: "Failed to fetch" or "Network Error"
**Cause**: Server is not running or not accessible
**Solution**: 
- Verify server is running: `curl http://localhost:5000/api/health`
- Check if port 5000 is in use by another process

### Issue 2: CORS Error
**Cause**: Client port doesn't match CORS configuration
**Solution**: 
- Check which port your client is running on (look at the Vite output)
- Update server.js CORS origin to match that port

### Issue 3: "User already exists"
**Cause**: Email is already registered
**Solution**: 
- Use a different email address
- Or delete the user from the database

### Issue 4: Database Connection Error
**Cause**: PostgreSQL is not running or credentials are wrong
**Solution**:
- Check if PostgreSQL is running
- Verify .env file has correct database credentials

## Quick Test
Run this command to test the server directly:
```powershell
$body = @{name='Direct Test';email='directtest@example.com';password='password123';role='analyst'} | ConvertTo-Json; Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/signup' -Method POST -Body $body -ContentType 'application/json'
```

If this works but the browser doesn't, it's a client-side issue.
If this fails, it's a server-side issue.

## Next Steps
After following these steps, report back with:
1. What you see in the browser console
2. What you see in the server terminal
3. The exact error message you're getting
