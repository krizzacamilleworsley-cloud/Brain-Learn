import { Link } from "react-router-dom";
import { Sparkles, Trophy, Zap, Award, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

const Landing = () => {
  const { user } = useFirebaseAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />

        <div className="container relative py-24 md:py-36 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> A new way to learn English
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight">
            <span className="text-neon">PRESS START</span>
            <br />
            <span className="text-neon-cyan">TO LEVEL UP</span>
            <br />
            <span className="text-neon-lime">YOUR ENGLISH</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground">
            Battle through Easy → Medium → Hard quests. Earn XP, unlock badges,
            climb the leaderboard, and walk away with a certificate of mastery.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button variant="hero" size="xl" className="gap-2">
                {user ? "Continue Quest" : "Start Your Quest"} <ChevronRight />
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="cyan" size="xl" className="gap-2">
                <Trophy /> Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Levels showcase */}
      <section className="container py-20">
        <h2 className="font-display text-2xl md:text-3xl text-center mb-14 text-neon">
          THREE LEVELS · ONE CHAMPION
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { emoji: "🌱", name: "EASY", color: "secondary", desc: "Vocabulary basics, simple grammar. Build your foundation." },
            { emoji: "⚡", name: "MEDIUM", color: "primary",   desc: "Mixed tenses, conditionals, idioms. The heat rises." },
            { emoji: "🔥", name: "HARD",   color: "accent",    desc: "Advanced grammar, literary nuance. Boss fight time." },
          ].map((l) => (
            <div
              key={l.name}
              className={`glass-card relative overflow-hidden rounded-2xl p-8 hover:-translate-y-2 transition-transform animate-float-y`}
              style={{ animationDelay: `${Math.random()}s` }}
            >
              <div className="text-6xl mb-4">{l.emoji}</div>
              <div className={`font-display text-xl mb-3 text-${l.color}`}>{l.name}</div>
              <p className="text-muted-foreground">{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 grid gap-6 md:grid-cols-3">
        {[
          { icon: Zap,    title: "AI-Powered Quests",  body: "Every session is fresh — questions tailored to your level." },
          { icon: Award,  title: "Badges & XP",        body: "Earn collectible badges and rack up XP for every win." },
          { icon: BookOpen, title: "Champion Certificate", body: "Conquer all three levels and download your PDF trophy." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="glass-card rounded-2xl p-6">
            <Icon className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-display text-base mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{body}</p>
          </div>
        ))}
      </section>

      <footer className="container py-10 text-center text-sm text-muted-foreground">
        Developer - Camille & Princess <br />
      BrainLearn © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Landing;
