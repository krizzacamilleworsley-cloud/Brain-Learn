import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { signInWithGoogle } from "@/lib/auth";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useFirebaseAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      console.log("🎮 Starting Google authentication...");
      await signInWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      
      // Provide helpful debugging info
      if (errorMessage.includes("400")) {
        setError(
          "Configuration error: Google OAuth is not properly set up. Check GOOGLE_OAUTH_SETUP.md for setup instructions."
        );
      } else if (errorMessage.includes("redirect")) {
        setError(
          "Redirect URI mismatch: The redirect URL doesn't match your Google Cloud configuration."
        );
      } else {
        setError(errorMessage);
      }
      
      console.error("🔴 Auth error:", err);
      console.error("💡 Debug: Check browser console and Supabase dashboard for details");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container flex flex-col items-center justify-center py-24">
        <div className="glass-card relative w-full max-w-md rounded-3xl p-10 text-center scanlines">
          <Sparkles className="mx-auto h-10 w-10 text-primary animate-flicker" />
          <h1 className="font-display text-2xl mt-4 text-neon">ENTER THE ARCADE</h1>
          <p className="text-muted-foreground mt-4 mb-8">
            Sign in with Google to save your XP, unlock badges, and climb the
            leaderboard.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-left">{error}</div>
            </div>
          )}

          <Button
            variant="hero"
            size="xl"
            className="w-full gap-3"
            onClick={handleSignIn}
            disabled={isSigningIn}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.35 11.1h-9.18v2.94h5.27c-.23 1.41-1.66 4.14-5.27 4.14-3.17 0-5.76-2.62-5.76-5.84s2.59-5.84 5.76-5.84c1.81 0 3.02.77 3.71 1.43l2.53-2.43C16.78 3.91 14.66 3 12.17 3 7.45 3 3.62 6.83 3.62 11.34s3.83 8.34 8.55 8.34c4.94 0 8.21-3.47 8.21-8.36 0-.56-.06-.99-.13-1.42z" />
            </svg>
            {isSigningIn ? "Signing in..." : "Sign in with Google"}
          </Button>

          <p className="text-xs text-muted-foreground mt-6">
            By continuing you agree to play fair and have fun.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
