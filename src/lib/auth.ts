import { signInWithPopup, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";

export async function signInWithGoogle(): Promise<User> {
  try {
    console.log("🔐 Initiating Firebase Google OAuth sign-in...");

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("✅ Firebase Google sign-in successful:", user.email);

    // Sync user data with Supabase (optional - for existing database)
    try {
      await syncUserWithSupabase(user);
    } catch (syncError) {
      console.warn("⚠️ Supabase sync warning (non-critical):", syncError);
    }

    return user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to sign in with Google";
    console.error("❌ Firebase Google sign-in failed:", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function signOut() {
  try {
    console.log("🔐 Signing out from Firebase...");

    await firebaseSignOut(auth);

    // Also sign out from Supabase if needed
    try {
      await supabase.auth.signOut();
    } catch (supabaseError) {
      console.warn("⚠️ Supabase sign out warning:", supabaseError);
    }

    console.log("✅ Sign out successful");
    window.location.href = "/";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Sign out failed";
    console.error("❌ Sign out failed:", errorMessage);
  }
}

// Sync Firebase user with Supabase database (for existing schema compatibility)
async function syncUserWithSupabase(firebaseUser: User) {
  try {
    // Create or update user profile in Supabase
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: firebaseUser.uid, // Use Firebase UID as Supabase user ID
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
        avatar_url: firebaseUser.photoURL,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn("⚠️ Profile sync warning:", error);
    } else {
      console.log("✅ User profile synced with Supabase");
    }
  } catch (error) {
    console.warn("⚠️ Supabase sync failed:", error);
  }
}

// Legacy functions for Supabase compatibility (if needed)
export async function signInWithMagicLink(email: string) {
  console.warn("⚠️ Magic link not implemented with Firebase - use Google OAuth");
  throw new Error("Magic link authentication not available. Please use Google sign-in.");
}

export async function signInWithPassword(email: string, password: string) {
  console.warn("⚠️ Password auth not implemented with Firebase - use Google OAuth");
  throw new Error("Password authentication not available. Please use Google sign-in.");
}

export async function signUp(email: string, password: string, displayName?: string) {
  console.warn("⚠️ Sign up not implemented with Firebase - use Google OAuth");
  throw new Error("User registration not available. Please use Google sign-in.");
}

export async function resetPassword(email: string) {
  console.warn("⚠️ Password reset not implemented with Firebase - use Google OAuth");
  throw new Error("Password reset not available. Please use Google sign-in.");
}

export async function getCurrentUser() {
  return auth.currentUser;
}
