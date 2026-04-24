import { supabase } from "@/integrations/supabase/client";

// Temporary fix: Create profile with Firebase UID as string
export async function ensureProfileExists(firebaseUser: any) {
  if (!firebaseUser?.uid) return;

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', firebaseUser.uid)
      .maybeSingle();

    if (!existingProfile) {
      // Create profile with Firebase UID as string
      await supabase
        .from('profiles')
        .insert({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Player',
          avatar_url: firebaseUser.photoURL,
          total_xp: 0,
          current_level: 'easy'
        });
      
      console.log('✅ Profile created for Firebase user:', firebaseUser.uid);
    }
  } catch (error) {
    console.error('❌ Error ensuring profile exists:', error);
  }
}