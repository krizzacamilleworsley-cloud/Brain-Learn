import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, X, ChevronRight, ArrowLeft, Sparkles, Trophy, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NavBar } from "@/components/NavBar";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { LEVEL_META, type Level, ALL_LEVELS } from "@/lib/levels";
import {
  downloadCertificate,
  getCertificatePreviewUrl,
  type CertificateData,
} from "@/lib/certificate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const Quiz = () => {
  const { level } = useParams<{ level: Level }>();
  const navigate = useNavigate();
  const { user, loading } = useFirebaseAuth();

  const meta = level && ALL_LEVELS.includes(level) ? LEVEL_META[level] : null;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQs, setLoadingQs] = useState(true);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [done, setDone] = useState(false);
  const [savedXp, setSavedXp] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [championUnlocked, setChampionUnlocked] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string>("certificate.pdf");
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastBonus, setLastBonus] = useState<{ xp: number; tier: "fast" | "quick" | "normal" | "miss" } | null>(null);
  const intervalRef = useRef<number | null>(null);

  const totalSeconds = meta?.secondsPerQuestion ?? 20;

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!meta || !level) return;
    setLoadingQs(true);
    supabase.functions
      .invoke("generate-questions", { body: { level, count: meta.questions } })
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message ?? "Failed to load questions");
          return;
        }
        if ((data as any)?.error) {
          toast.error((data as any).error);
          return;
        }
        const qs = (data as any)?.questions ?? [];
        setQuestions(qs);
      })
      .finally(() => setLoadingQs(false));
  }, [level, meta]);

  // Per-question countdown timer
  useEffect(() => {
    if (!meta || loadingQs || done || questions.length === 0 || revealed) return;
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
  }, [idx, loadingQs, done, questions.length, revealed, totalSeconds]);

  if (!meta) return <div className="p-10 text-center">Unknown level</div>;
  if (loading || !user) return <div className="p-10 text-center font-display animate-flicker text-primary">LOADING...</div>;

  const currentQ = questions[idx];

  function computeBonus(remaining: number) {
    const ratio = remaining / totalSeconds;
    if (ratio >= 2 / 3) return { mult: 1.5, tier: "fast" as const };
    if (ratio >= 1 / 3) return { mult: 1.25, tier: "quick" as const };
    return { mult: 1, tier: "normal" as const };
  }

  function handleAnswer(i: number | null) {
    if (revealed) return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setSelected(i);
    setRevealed(true);
    if (i !== null && currentQ && i === currentQ.correctIndex) {
      const { mult, tier } = computeBonus(timeLeft);
      const gained = Math.round(meta!.xpPerCorrect * mult);
      setCorrectCount((c) => c + 1);
      setEarnedXp((x) => x + gained);
      setLastBonus({ xp: gained, tier });
    } else {
      setLastBonus({ xp: 0, tier: "miss" });
    }
  }

  const handleSelect = (i: number) => handleAnswer(i);

  const handleNext = async () => {
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      setLastBonus(null);
    } else {
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const xpEarned = earnedXp;
    setSavedXp(xpEarned);
    setDone(true);

    if (!user) return;

    // Insert completion
    await supabase.from("level_completions").insert({
      user_id: user.id,
      level: level!,
      score: correctCount,
      xp_earned: xpEarned,
      questions_total: questions.length,
      questions_correct: correctCount,
    });

    // Update profile XP & current_level
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, current_level, display_name")
      .eq("id", user.id)
      .maybeSingle();

    const newTotal = (profile?.total_xp ?? 0) + xpEarned;
    const newCurrent = meta.next ?? level!;
    await supabase
      .from("profiles")
      .update({ total_xp: newTotal, current_level: newCurrent })
      .eq("id", user.id);

    // Award badges
    const earnedCodes: string[] = ["first_steps"];
    if (level === "easy")   earnedCodes.push("easy_master");
    if (level === "medium") earnedCodes.push("medium_master");
    if (level === "hard")   earnedCodes.push("hard_master");
    if (correctCount === questions.length) earnedCodes.push("perfectionist");

    // Champion badge if all 3 levels completed (include current run)
    const { data: completions } = await supabase
      .from("level_completions")
      .select("level")
      .eq("user_id", user.id);
    const distinctLevels = new Set((completions ?? []).map((c) => c.level));
    distinctLevels.add(level!);
    const isChampion = distinctLevels.size >= 3;
    if (isChampion) earnedCodes.push("champion");

    const { data: badgeRows } = await supabase
      .from("badges")
      .select("id, code, name")
      .in("code", earnedCodes);

    const { data: existing } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id);
    const existingIds = new Set((existing ?? []).map((r) => r.badge_id));

    const inserts = (badgeRows ?? [])
      .filter((b) => !existingIds.has(b.id))
      .map((b) => ({ user_id: user.id, badge_id: b.id }));

    if (inserts.length) {
      await supabase.from("user_badges").insert(inserts);
      const newOnes = (badgeRows ?? []).filter((b) => !existingIds.has(b.id)).map((b) => b.name);
      setNewBadges(newOnes);
    }

    // Build a certificate for EVERY level completion. If all 3 levels are
    // cleared this run also issues the Champion certificate.
    const certName =
      profile?.display_name ?? user.email?.split("@")[0] ?? "Player";

    const certData: CertificateData = isChampion
      ? { kind: "champion", name: certName, totalXp: newTotal }
      : {
          kind: "level",
          name: certName,
          level: level!,
          correct: correctCount,
          total: questions.length,
          xpEarned,
          totalXp: newTotal,
        };

    if (isChampion) setChampionUnlocked(true);
    setCertificate(certData);

    try {
      const { url, filename } = getCertificatePreviewUrl(certData);
      setPreviewUrl(url);
      setPreviewFilename(filename);
      setPreviewOpen(true);
    } catch (e) {
      console.error("certificate error", e);
      toast.error("Could not generate certificate");
    }
  };

  const handleDownloadCertificate = () => {
    if (!certificate) return;
    try {
      downloadCertificate(certificate);
      toast.success("Certificate downloaded!");
    } catch (e) {
      console.error("download error", e);
      toast.error("Could not download certificate");
    }
  };

  if (loadingQs) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container py-24 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary animate-flicker" />
          <p className="mt-6 font-display text-neon">SUMMONING QUESTIONS...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container py-24 text-center">
          <p className="text-muted-foreground mb-6">Couldn't load questions for this level.</p>
          <Link to="/dashboard"><Button variant="neon"><ArrowLeft /> Back to dashboard</Button></Link>
        </div>
      </div>
    );
  }

  if (done) {
    const perfect = correctCount === questions.length;
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container py-16 max-w-2xl">
          <div className="glass-card rounded-3xl p-10 text-center scanlines relative">
            <div className="text-6xl mb-4">{perfect ? "🏆" : meta.emoji}</div>
            <h1 className="font-display text-3xl text-neon mb-2">
              {perfect ? "FLAWLESS VICTORY" : "QUEST CLEARED"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {meta.label} level · {correctCount} / {questions.length} correct
            </p>
            <div className="font-display text-5xl text-neon-lime mb-2">+{savedXp} XP</div>

            {newBadges.length > 0 && (
              <div className="mt-8 glass-card rounded-2xl p-6 border-accent/40">
                <div className="text-xs uppercase tracking-widest text-accent mb-3">New Badges Unlocked</div>
                <div className="font-display text-sm">{newBadges.join(" · ")}</div>
              </div>
            )}

            {certificate && (
              <div
                className={`mt-8 glass-card rounded-2xl p-6 border-2 ${
                  championUnlocked
                    ? "border-secondary/60 shadow-[0_0_30px_hsl(var(--secondary)/0.4)]"
                    : "border-primary/50 shadow-[0_0_25px_hsl(var(--primary)/0.3)]"
                }`}
              >
                <div className="text-5xl mb-2">📜</div>
                <div className="font-display text-lg text-neon-lime mb-1">
                  {championUnlocked
                    ? "CHAMPION CERTIFICATE ISSUED"
                    : `${meta.label.toUpperCase()} LEVEL CERTIFICATE`}
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  Awarded to {certificate.name}
                  {!championUnlocked &&
                    ` · ${correctCount}/${questions.length} correct`}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="neon"
                    size="lg"
                    className="gap-2"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Sparkles /> Preview
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    className="gap-2"
                    onClick={handleDownloadCertificate}
                  >
                    <Trophy /> Download
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Link to="/dashboard"><Button variant="neon" size="lg"><Trophy /> Dashboard</Button></Link>
              {meta.next && (
                <Link to={`/quiz/${meta.next}`}>
                  <Button variant="hero" size="lg" className="gap-2">Next Level <ChevronRight /></Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Certificate preview modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-background">
            <DialogHeader className="p-5 border-b border-border">
              <DialogTitle className="font-display text-neon-lime">
                {championUnlocked ? "Champion Certificate" : `${meta.label} Level Certificate`}
              </DialogTitle>
              <DialogDescription>
                Preview your certificate before downloading the PDF.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/30 h-[65vh]">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="Certificate preview"
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Generating preview…
                </div>
              )}
            </div>
            <div className="p-4 flex flex-wrap gap-2 justify-end border-t border-border">
              <Button variant="ghost" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
              <Button variant="hero" className="gap-2" onClick={handleDownloadCertificate}>
                <Trophy /> Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
          <div className={`font-display text-sm text-${meta.color}`}>
            {meta.emoji} {meta.label.toUpperCase()}
          </div>
          <div className="text-sm text-muted-foreground">
            {idx + 1} / {questions.length}
          </div>
        </div>

        <Progress value={((idx + (revealed ? 1 : 0)) / questions.length) * 100} className="h-2 mb-4" />

        {/* Countdown timer */}
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
            {currentQ.question}
          </p>

          <div className="space-y-3">
            {currentQ.options.map((opt, i) => {
              const isCorrect = i === currentQ.correctIndex;
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
                  onClick={() => handleSelect(i)}
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
              {lastBonus.tier === "miss" && (selected === null ? "⏰ TIME'S UP!" : "✗ MISSED")}
              {lastBonus.tier === "fast"   && <>⚡ LIGHTNING! +{lastBonus.xp} XP <span className="opacity-70">(×1.5)</span></>}
              {lastBonus.tier === "quick"  && <>🔥 QUICK! +{lastBonus.xp} XP <span className="opacity-70">(×1.25)</span></>}
              {lastBonus.tier === "normal" && <>✓ CORRECT! +{lastBonus.xp} XP</>}
            </div>
          )}

          {revealed && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <div className="font-bold text-accent mb-1">💡 Explanation</div>
              <div className="text-muted-foreground">{currentQ.explanation}</div>
            </div>
          )}

          {revealed && (
            <Button variant="hero" size="lg" className="w-full mt-6 gap-2" onClick={handleNext}>
              {idx + 1 < questions.length ? "Next Question" : "Finish Quest"} <ChevronRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
