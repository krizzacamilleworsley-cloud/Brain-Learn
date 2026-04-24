import { Link, useLocation } from "react-router-dom";
import { Trophy, Sparkles, LogOut, User as UserIcon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { signOut } from "@/lib/auth";

export function NavBar() {
  const { user } = useFirebaseAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-sm">
          <Sparkles className="h-5 w-5 text-primary animate-flicker" />
          <span className="text-neon">BRAIN<span className="text-neon-cyan">LEARN</span></span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          {user && (
            <>
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-2 ${isActive("/dashboard") ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </Link>
              
              <Link to="/leaderboard">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-2 ${isActive("/leaderboard") ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Trophy className="h-4 w-4" />
                  <span>Leaderboard</span>
                </Button>
              </Link>
              
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-2 ${isActive("/dashboard") ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut} 
                className="gap-2 ml-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </>
          )}
          
          {!user && (
            <Link to="/auth">
              <Button variant="hero" size="sm">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
