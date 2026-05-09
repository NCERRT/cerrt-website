# Admin Account Setup

The CERRT admin panel does not have a public signup page for security reasons. Admin accounts must be created via the Convex CLI or Dashboard by someone with project access.

## Creating an Admin Account

### Option 1: Via Convex CLI (recommended)

From the project directory, run:

```bash
npx convex run auth:signUp '{"email":"admin@cerrt.gov.ng","password":"<strong-password>","name":"Admin Full Name"}'
```

**Password requirements:**
- Minimum 12 characters
- Maximum 128 characters
- Must not appear in known data breaches (HIBP check)

The command will return the new user's ID and a session ID.

### Option 2: Via Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select the CERRT project
3. Navigate to **Functions** tab
4. Find `auth:signUp` (under "Internal" functions)
5. Click "Run Function"
6. Enter args:
   ```json
   {
     "email": "admin@cerrt.gov.ng",
     "password": "<strong-password>",
     "name": "Admin Full Name"
   }
   ```
7. Click Run

## Login

Once an admin account is created, the user can log in at:
```
https://your-domain.com/admin/login
```

## Removing an Admin

To remove an admin account, delete the user record via Convex Dashboard:
1. Go to **Data** tab
2. Select the `users` table
3. Find the user by email
4. Delete the record

This will also invalidate any active sessions for that user (sessions are linked by userId).

## Password Reset

Currently, password reset requires deleting the user account and creating a new one. Future versions may include a password reset flow.

## Security Notes

- The `signUp` function is an `internalAction` - it is **not** callable from the public client/browser
- Only people with Convex project access can create admin accounts
- All admin actions require an authenticated session
- Sessions expire after 24 hours and require re-login
- Failed login attempts are rate-limited (5 attempts per 15 minutes per email)
