# Hairkeeper Firebase Migration Guide

## Phase 0: Environment Setup (Current Phase)

### Prerequisites

1. **Firebase Project Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named "hairkeeper-prod" (or your preferred name)
   - Note down the Project ID (e.g., `hairkeeper-prod-abc123`)

2. **Enable Firebase Services**
   - **Authentication**: Enable the following sign-in methods:
     - Google
     - Apple (for iOS)
     - Email/Password
   - **Firestore Database**: Create database in production mode
   - **Cloud Storage**: Set up a default bucket
   - **Cloud Functions**: Enable (for potential future use)

3. **Enable Google Cloud APIs**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - Enable the following APIs:
     - Cloud Speech-to-Text API
     - Vertex AI API
     - Cloud Storage API

4. **Create Service Account**
   - In Google Cloud Console, go to IAM & Admin → Service Accounts
   - Create a new service account named "firebase-admin"
   - Grant the following roles:
     - Firebase Admin SDK Administrator Service Agent
     - Vertex AI User
     - Storage Admin
   - Create and download a JSON key
   - Save it as `firebase-service-account.json` in the project root
   - **IMPORTANT**: Add `firebase-service-account.json` to `.gitignore`!

5. **Get Firebase Web Configuration**
   - In Firebase Console, go to Project Settings
   - Scroll down to "Your apps" section
   - Click "Add app" → "Web" (</> icon)
   - Register app and copy the configuration values
   - You'll need these for the client-side configuration

### Installation

Dependencies have been added to `package.json`. Run:

```bash
npm install
```

### Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration in `.env`:
   ```env
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   VERTEX_AI_LOCATION=us-central1

   # Keep feature flags at manus/forge during migration
   STORAGE_BACKEND=manus
   AI_BACKEND=forge

   # Firebase Client Configuration (from Firebase Console)
   EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. Ensure `.env` is in `.gitignore`

### Security Setup

Add these files to `.gitignore` if not already present:

```
.env
.env.local
.env.production
firebase-service-account.json
```

### Verification

After completing Phase 0 setup, verify:

1. Firebase project is accessible in Firebase Console
2. Service account JSON file is downloaded and placed correctly
3. All required APIs are enabled in Google Cloud Console
4. `.env` file is populated with correct values
5. Dependencies installed without errors: `npm install` succeeds

## Next Steps

Once Phase 0 is complete:
- Proceed to **Phase 1: Database Migration** - creating Firestore schema and dual-write layer
- The migration plan in `MIGRATION_PLAN.md` contains full details for all 7 phases

## Cost Estimation

### Firebase Free Tier (Spark Plan)
- Firestore: 50k reads, 20k writes, 20k deletes per day
- Authentication: Unlimited
- Storage: 5GB stored, 1GB downloaded per day

### Google Cloud Free Tier
- Vertex AI: $300 credit for 90 days
- Cloud Speech-to-Text: 60 minutes per month
- Cloud Storage: 5GB per month

### Recommended Plan
- Start with Firebase Spark (free) for development
- Upgrade to Blaze (pay-as-you-go) for production
- Monitor costs in Google Cloud Console

## Support

For issues during migration:
- Check Firebase Console for service status
- Review Google Cloud logs for API errors
- Ensure service account has correct permissions
- Verify all environment variables are set correctly
