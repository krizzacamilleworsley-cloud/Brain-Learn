import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Sparkles, Trophy, Timer, Zap, Check, X, ChevronRight, Infinity as InfinityIcon, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const BATCH_SIZE = 5;
const START_SECONDS = 18;
const MIN_SECONDS = 7;
const SECONDS_DECAY = 0.4; // shave off per question answered
const BASE_XP = 15;

const Endless = () => {
  const navigate = useNavigate();
  const { user, loading } = useFirebaseAuth();

  const [queue, setQueue] = useState<Question[]>([]);
  const [loadingQs, setLoadingQs] = useState(true);
  const [current, setCurrent] = useState<Question | null>(null);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(START_SECONDS);
  const [lastBonus, setLastBonus] = useState<{ pts: number; xp: number; tier: "fast" | "quick" | "normal" | "miss" } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const fetchingRef = useRef(false);
  const finishedRef = useRef(false);
  const livesRef = useRef(3);
  const gameOverRef = useRef(false);

  const totalSeconds = Math.max(MIN_SECONDS, START_SECONDS - answered * SECONDS_DECAY);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  // Load personal best
  useEffect(() => {
    if (!user) return;
    supabase
      .from("endless_runs")
      .select("score")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setBestScore(data?.score ?? 0));
  }, [user]);

  const fetchBatch = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: { level: "endless", count: BATCH_SIZE },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const qs: Question[] = (data as any)?.questions ?? [];
      setQueue((q) => [...q, ...qs]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load questions");
    } finally {
      fetchingRef.current = false;
    }
  };

  // Initial load
  useEffect(() => {
    setLoadingQs(true);
    fetchBatch().finally(() => setLoadingQs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull next question off the queue when needed
  useEffect(() => {
    if (done) return;
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
      setSelected(null);
      setRevealed(false);
      setLastBonus(null);
    }
    // Prefetch when running low
    if (queue.length <= 2 && !fetchingRef.current && !done) {
      fetchBatch();
    }
  }, [queue, current, done]);

  // Countdown timer
  useEffect(() => {
    if (!current || revealed || done) return;
    setTimeLeft(totalSeconds);
    const startedAt = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        handleAnswer(null);
      }
    }, 100);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, revealed, done]);

  function computeBonus(remaining: number) {
    const ratio = remaining / totalSeconds;
    if (ratio >= 2 / 3) return { mult: 1.5, tier: "fast" as const };
    if (ratio >= 1 / 3) return { mult: 1.25, tier: "quick" as const };
    return { mult: 1, tier: "normal" as const };
  }

  function handleAnswer(i: number | null) {
    if (revealed || !current || gameOverRef.current) return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setSelected(i);
    setRevealed(true);
    setAnswered((a) => a + 1);

    const isRight = i !== null && i === current.correctIndex;
    if (isRight) {
      const { mult, tier } = computeBonus(timeLeft);
      // Streak bonus: +10% per current streak (capped 2x)
      const streakMult = Math.min(2, 1 + streak * 0.1);
      const pts = Math.round(10 * mult * streakMult);
      const gainedXp = Math.round(BASE_XP * mult);
      setCorrect((c) => c + 1);
      setScore((s) => s + pts);
      setXp((x) => x + gainedXp);
      setStreak((s) => {
        const next = s + 1;
        setLongestStreak((l) => Math.max(l, next));
        return next;
      });
      setLastBonus({ pts, xp: gainedXp, tier });
    } else {
      const remaining = livesRef.current - 1;
      livesRef.current = remaining;
      setStreak(0);
      setLives(remaining);
      setLastBonus({ pts: 0, xp: 0, tier: "miss" });

      // Auto-end the run the moment lives hit zero — don't wait for "Next".
      if (remaining <= 0) {
        gameOverRef.current = true;
        // Small delay so the user sees the correct answer + miss banner first.
        window.setTimeout(() => {
          finishRun();
        }, 1200);
      }
    }
  }

  const handleNext = async () => {
    if (livesRef.current <= 0 || gameOverRef.current) {
      await finishRun();
      return;
    }
    setCurrent(null); // triggers next pull
  };

  const finishRun = async () => {
    // Hard guard against double-insert from concurrent paths
    // (timer expiry + click on "Next", auto-finish + manual click, etc.)
    if (finishedRef.current) return;
    finishedRef.current = true;
    gameOverRef.current = true;
    setDone(true);
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    if (!user) return;

    // Insert run
    await supabase.from("endless_runs").insert({
      user_id: user.id,
      score,
      questions_answered: answered,
      questions_correct: correct,
      xp_earned: xp,
      longest_streak: longestStreak,
    });

    // Update profile XP
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", user.id)
      .maybeSingle();
    const newTotal = (profile?.total_xp ?? 0) + xp;
    await supabase.from("profiles").update({ total_xp: newTotal }).eq("id", user.id);

    // Update best
    if (score > bestScore) {
      setBestScore(score);
      toast.success("🏆 New personal best!");
    }

    // Award endless badges
    const earned: string[] = ["endless_initiate"];
    if (longestStreak >= 10) earned.push("endless_streak_10");
    if (longestStreak >= 25) earned.push("endless_streak_25");

    const { data: badgeRows } = await supabase
      .from("badges")
      .select("id, code, name")
      .in("code", earned);
    const { data: existing } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id);
    const existingIds = new Set((existing ?? []).map((r) => r.badge_id));
    const inserts = (badgeRows ?? [])
      .filter((b) => !existingIds.has(b.id))
      .map((b) => ({ user_id: user.id, badge_id: b.id }));
    if (inserts.length) await supabase.from("user_badges").insert(inserts);
  };

  const restart = () => {
    setQueue([]);
    setCurrent(null);
    setAnswered(0);
    setCorrect(0);
    setScore(0);
    setXp(0);
    setStreak(0);
    setLongestStreak(0);
    setLives(3);
    setSelected(null);
    setRevealed(false);
    setDone(false);
    setLastBonus(null);
    livesRef.current = 3;
    finishedRef.current = false;
    gameOverRef.current = false;
    setLoadingQs(true);
    fetchBatch().finally(() => setLoadingQs(false));
  };

  if (loading || !user) {
    return <div className="p-10 text-center font-display animate-flicker text-primary">LOADING...</div>;
  }

  if (loadingQs && !current) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container py-24 text-center">
          <InfinityIcon className="mx-auto h-12 w-12 text-secondary animate-flicker" />
          <p className="mt-6 font-display text-neon-cyan">SUMMONING ENDLESS QUESTIONS...</p>
        </div>
      </div>
    );
  }

  if (done) {
    const isNewBest = score > 0 && score >= bestScore;
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container py-16 max-w-2xl">
          <div className="glass-card rounded-3xl p-10 text-center scanlines">
            <div className="text-6xl mb-4">{isNewBest ? "🏆" : "💀"}</div>
            <h1 className="font-display text-3xl text-neon mb-2">
              {isNewBest ? "NEW HIGH SCORE!" : "RUN ENDED"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {correct} / {answered} correct · longest streak {longestStreak}
            </p>
            <div className="font-display text-6xl text-neon-lime mb-2">{score}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">SCORE</div>
            <div className="font-display text-lg text-accent">+{xp} XP</div>
            <div className="text-xs text-muted-foreground mt-1">
              Personal best: {Math.max(bestScore, score)}
            </div>

            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Button variant="hero" size="lg" className="gap-2" onClick={restart}>
                <InfinityIcon /> Play Again
              </Button>
              <Link to="/leaderboard?tab=endless">
                <Button variant="cyan" size="lg" className="gap-2">
                  <Trophy /> Leaderboard
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="neon" size="lg" className="gap-2">
                  <ArrowLeft /> Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container py-24 text-center">
          <InfinityIcon className="mx-auto h-12 w-12 text-secondary animate-flicker" />
          <p className="mt-6 font-display text-neon-cyan">LOADING NEXT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container py-10 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Quit
          </Link>
          <div className="font-display text-sm text-secondary inline-flex items-center gap-1.5">
            <InfinityIcon className="h-4 w-4" /> ENDLESS
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-5 w-5 ${i < lives ? "text-destructive fill-destructive" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
            <div className="font-display text-xl text-neon-lime">{score}</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
              <Flame className="h-3 w-3" /> Streak
            </div>
            <div className={`font-display text-xl ${streak >= 5 ? "text-accent animate-pulse" : "text-foreground"}`}>
              {streak}
            </div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Best</div>
            <div className="font-display text-xl text-secondary">{bestScore}</div>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5 text-xs font-display">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Timer className="h-3.5 w-3.5" /> TIME
            </span>
            <span
              className={
                timeLeft / totalSeconds > 2 / 3
                  ? "text-neon-lime"
                  : timeLeft / totalSeconds > 1 / 3
                    ? "text-primary"
                    : "text-destructive animate-pulse"
              }
            >
              {timeLeft.toFixed(1)}s
              {!revealed && timeLeft / totalSeconds > 2 / 3 && (
                <span className="ml-2 text-neon-lime inline-flex items-center gap-1">
                  <Zap className="h-3 w-3" />×1.5
                </span>
              )}
              {!revealed && timeLeft / totalSeconds <= 2 / 3 && timeLeft / totalSeconds > 1 / 3 && (
                <span className="ml-2 text-primary">×1.25</span>
              )}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-[width] duration-100 ease-linear ${
                timeLeft / totalSeconds > 2 / 3
                  ? "bg-secondary"
                  : timeLeft / totalSeconds > 1 / 3
                    ? "bg-primary"
                    : "bg-destructive"
              }`}
              style={{ width: `${(timeLeft / totalSeconds) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 md:p-8">
          <p className="font-display text-base md:text-lg leading-relaxed text-neon-cyan mb-8">
            {current.question}
          </p>

          <div className="space-y-3">
            {current.options.map((opt, i) => {
              const isCorrect = i === current.correctIndex;
              const isPicked = i === selected;
              const stateClass = !revealed
                ? "border-border hover:border-primary hover:bg-primary/10"
                : isCorrect
                  ? "border-success bg-success/15 text-foreground shadow-[0_0_20px_hsl(var(--success)/0.4)]"
                  : isPicked
                    ? "border-destructive bg-destructive/15"
                    : "border-border opacity-60";
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={revealed}
                  className={`w-full text-left rounded-xl border-2 px-5 py-4 transition flex items-center justify-between ${stateClass}`}
                >
                  <span className="font-medium">{opt}</span>
                  {revealed && isCorrect && <Check className="h-5 w-5 text-success" />}
                  {revealed && isPicked && !isCorrect && <X className="h-5 w-5 text-destructive" />}
                </button>
              );
            })}
          </div>

          {revealed && lastBonus && (
            <div
              className={`mt-6 rounded-xl border-2 p-3 text-center font-display text-sm ${
                lastBonus.tier === "miss"
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : lastBonus.tier === "fast"
                    ? "border-secondary/60 bg-secondary/10 text-neon-lime shadow-[0_0_20px_hsl(var(--secondary)/0.3)]"
                    : lastBonus.tier === "quick"
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-accent/60 bg-accent/10 text-accent"
              }`}
            >
              {lastBonus.tier === "miss" && (selected === null ? "⏰ TIME'S UP! −1 ❤" : "✗ MISSED −1 ❤")}
              {lastBonus.tier === "fast"   && <>⚡ LIGHTNING! +{lastBonus.pts} pts · +{lastBonus.xp} XP</>}
              {lastBonus.tier === "quick"  && <>🔥 QUICK! +{lastBonus.pts} pts · +{lastBonus.xp} XP</>}
              {lastBonus.tier === "normal" && <>✓ CORRECT! +{lastBonus.pts} pts · +{lastBonus.xp} XP</>}
            </div>
          )}

          {revealed && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <div className="font-bold text-accent mb-1">💡 Explanation</div>
              <div className="text-muted-foreground">{current.explanation}</div>
            </div>
          )}

          {revealed && (
            <Button variant="hero" size="lg" className="w-full mt-6 gap-2" onClick={handleNext}>
              {lives <= 0 ? "See Results" : "Next Question"} <ChevronRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Endless;
