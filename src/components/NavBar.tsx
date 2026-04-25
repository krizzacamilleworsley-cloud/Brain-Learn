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
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4">
        <Link to="/" className="flex items-center gap-1 sm:gap-2 font-display text-sm">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-flicker" />
          <span className="text-neon text-xs sm:text-sm">
            <span className="hidden sm:inline">BRAIN</span>
            <span className="sm:hidden">BL</span>
            <span className="text-neon-cyan">
              <span className="hidden sm:inline">LEARN</span>
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-2">
          {user && (
            <>
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  className={`h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 ${isActive("/dashboard") ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Home</span>
                </Button>
              </Link>
              
              <Link to="/leaderboard">
                <Button 
                  variant="ghost" 
                  className={`h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 ${isActive("/leaderboard") ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Leaderboard</span>
                </Button>
              </Link>
              
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  className={`h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 ${isActive("/dashboard") ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Dashboard</span>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={signOut} 
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 ml-1 sm:ml-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Sign out</span>
              </Button>
            </>
          )}
          
          {!user && (
            <Link to="/auth">
              <Button variant="hero" size="sm" className="px-2 sm:px-4 text-xs sm:text-sm">
                <span className="hidden sm:inline">Sign in</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}