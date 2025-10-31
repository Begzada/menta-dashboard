# Testing Authorization

## How the Authorization Works

### Client-Side Requests (from browser)
When you make requests from client components (pages with `'use client'`), the axios interceptor automatically:

1. Reads the `menta_session` cookie from the browser
2. Adds the Authorization header: `Bearer session_id:{your-session-id}`
3. Sends the request to the API

### Server-Side Requests (SSR/Server Components)
For server components (like the dashboard overview page), you need to manually pass the token:

```typescript
const config = {
  headers: {
    Authorization: `Bearer session_id:${token}`,
  },
};

await axiosClient.get('/accounts/stats', config);
```

## Testing the Authorization

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and go to the Network tab. When you:
- Login with OTP
- Navigate to any dashboard page
- You should see API requests with the Authorization header

### 2. Verify Cookie is Set
After logging in:
1. Open Developer Tools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Look under Cookies → http://localhost:3000
4. You should see a cookie named `menta_session` with your session ID

### 3. Manual API Test
You can test the API directly with curl:

```bash
# Replace YOUR_SESSION_ID with the actual session ID from the cookie
curl -H "Authorization: Bearer session_id:YOUR_SESSION_ID" \
     http://localhost:8080/api/v1/accounts/stats
```

## Debugging Authorization Issues

### Issue: "Authorization header not being sent"

**Check these:**

1. **Cookie exists**: Verify the `menta_session` cookie is set after login
2. **Cookie domain**: Make sure the cookie is accessible on your domain
3. **CORS**: Backend must allow the Authorization header

### Issue: "401 Unauthorized"

**Possible causes:**

1. Session ID is invalid or expired
2. Backend is not recognizing the token format
3. Token format should be exactly: `Bearer session_id:YOUR_SESSION_ID_HERE`

### Issue: "Headers not showing in Network tab"

**Try:**

1. Clear browser cache and cookies
2. Login again
3. Check Network tab → Select a request → Look at Request Headers

## Expected Authorization Header Format

Based on your Postman collection, the header should be:

```
Authorization: Bearer session_id:9b623d34-a31a-4de9-9f54-5bbfa2a68e5a
```

Where:
- `Bearer` is the auth type
- `session_id:` is the prefix
- The UUID after the colon is your actual session ID

## Code Reference

The authorization is handled in:
- **Client-side**: `/lib/axios-client.ts` (line 23-24)
- **Server-side**: `/app/dashboard/page.tsx` (line 11-15)

## Quick Test

Run the dev server and try this in your browser console after logging in:

```javascript
// Get the session cookie
const cookies = document.cookie.split(';');
const sessionCookie = cookies.find(c => c.trim().startsWith('menta_session='));
const token = sessionCookie ? sessionCookie.split('=')[1] : null;

console.log('Session Token:', token);
console.log('Authorization Header:', `Bearer session_id:${token}`);
```

This will show you exactly what authorization header is being sent.
