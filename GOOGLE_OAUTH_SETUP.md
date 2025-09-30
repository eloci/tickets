# Google OAuth Setup Guide

The 400 error you're experiencing when trying to sign in with Google is due to missing or invalid Google OAuth credentials. Here's how to fix it:

## Current Status
✅ **FIXED**: NextAuth secret key updated
✅ **FIXED**: Google OAuth temporarily disabled to prevent 400 errors
✅ **WORKING**: Email authentication with credentials

## Steps to Enable Google OAuth

### 1. Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 2. Enable Google+ API
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API" 
3. Click "Enable"

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add these authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   ```

### 4. Update Environment Variables
Once you have your credentials, update `.env.local`:

```bash
# Google OAuth (replace with your actual credentials)
GOOGLE_CLIENT_ID="your_actual_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_actual_google_client_secret_here"
```

### 5. Restart the Server
After updating the environment variables:
```bash
npm run dev
```

## Alternative: Use Email Authentication

The system also supports email/password authentication which is currently working. Users can:

1. **Sign up** with email and password
2. **Sign in** with email and password
3. **Reset passwords** (if implemented)

## Current Authentication Methods Available

- ✅ **Email/Password**: Fully functional
- ⏸️ **Google OAuth**: Disabled (can be enabled with proper setup)
- 🚫 **Other OAuth**: Not configured

## Testing Authentication

You can test the current email authentication by:
1. Going to `/auth/signin`
2. Creating an account with email/password
3. Signing in with those credentials

## Need Help?

If you need assistance setting up Google OAuth credentials, let me know and I can guide you through the process step by step.