# Firebase Auth Setup Guide for Level Up English

This guide shows how to replace Supabase authentication with Firebase Authentication for Google OAuth.

## Option 1: Full Firebase Migration (Recommended)

Replace Supabase entirely with Firebase (Auth + Firestore Database).

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing
3. Enable Google Analytics (optional)
4. Choose project name: "Level Up English"
5. Click "Create project"

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Google** provider
5. Add your project name and support email
6. Click **Save**

### Step 3: Get Firebase Config
1. Go to **Project settings** (gear icon)
2. Scroll to "Your apps" section
3. Click **Add app** → **Web app** (</>)
4. Register app with name "Level Up English Web"
5. Copy the Firebase config object

### Step 4: Install Firebase SDK
```bash
bun add firebase
# or
npm install firebase
```

### Step 5: Replace Supabase with Firebase

Create `src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

Update `src/lib/auth.ts`:
```typescript
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('User signed in:', result.user);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    window.location.href = '/';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}
```

### Step 6: Update useAuth Hook

Create `src/hooks/useFirebaseAuth.ts`:
```typescript
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

### Step 7: Migrate Database to Firestore

Replace Supabase database calls with Firestore:
```typescript
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Example: Get user profile
export async function getUserProfile(userId: string) {
  const q = query(collection(db, 'profiles'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[0]?.data();
}
```

## Option 2: Firebase Auth + Supabase Database (Hybrid)

Keep Supabase database but use Firebase for authentication only.

### Pros:
- Keep existing database schema
- Use Firebase's superior Google OAuth
- Less refactoring needed

### Cons:
- More complex architecture
- Need to sync auth state between services
- Potential latency issues

### Implementation:
1. Set up Firebase Auth as above
2. Keep Supabase client for database
3. Create custom auth bridge to sync Firebase user with Supabase

## Option 3: Quick Firebase Auth Test (Minimal Changes)

Add Firebase alongside Supabase for testing:

```typescript
// src/lib/auth.ts - Add Firebase option
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export async function signInWithFirebaseGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Then create Supabase session or sync user data
    console.log('Firebase auth successful:', result.user);
    return result.user;
  } catch (error) {
    console.error('Firebase auth error:', error);
    throw error;
  }
}
```

## Firebase vs Supabase Comparison

| Feature | Firebase Auth | Supabase Auth |
|---------|---------------|---------------|
| Google OAuth Setup | ⚡ **Very Easy** | 🔧 Moderate |
| Database | Firestore (NoSQL) | PostgreSQL (SQL) |
| Real-time | ✅ Excellent | ✅ Good |
| File Storage | ✅ Firebase Storage | ✅ Supabase Storage |
| Functions | ✅ Cloud Functions | ✅ Edge Functions |
| Pricing | Free tier generous | Free tier generous |
| Ecosystem | Google services | PostgreSQL ecosystem |

## Recommendation

**For Google OAuth specifically: Use Firebase Auth** - it's Google's own service and will have the best Google integration.

**For the full app:** If you want to keep the SQL database and existing schema, stick with Supabase but configure Google OAuth properly. Firebase would require migrating your entire database schema.

## Quick Firebase Setup (5 minutes)

If you want to test Firebase Auth quickly:

1. Create Firebase project
2. Enable Google provider
3. Copy config to `.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```
4. Add Firebase auth button to test

Would you like me to implement Firebase Auth for you? Which option interests you most?