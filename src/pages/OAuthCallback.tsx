import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log("✅ Firebase OAuth successful, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("⚠️ No Firebase user found, redirecting to auth");
        navigate("/auth", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-lg text-muted-foreground">
          {loading ? "Completing sign-in..." : "Redirecting..."}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
