import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Play, Trophy, Award, Download, Sparkles, ScrollText, Infinity as InfinityIcon, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NavBar } from "@/components/NavBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { ALL_LEVELS, LEVEL_META, type Level } from "@/lib/levels";
import {
  downloadCertificate,
  getCertificatePreviewUrl,
  type CertificateData,
} from "@/lib/certificate";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_level: string;
}
interface Badge { id: string; code: string; name: string; description: string; icon: string; }

interface LevelRun {
  level: Level;
  questions_total: number;
  questions_correct: number;
  xp_earned: number;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading } = useFirebaseAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bestRuns, setBestRuns] = useState<Record<Level, LevelRun | undefined>>(
    {} as Record<Level, LevelRun | undefined>
  );
  const [badges, setBadges] = useState<Badge[]>([]);
  const [endlessBest, setEndlessBest] = useState<{ score: number; longest_streak: number } | null>(null);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificateData | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: completions }, { data: ub }, { data: endless }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, avatar_url, total_xp, current_level")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("level_completions")
          .select("level, questions_total, questions_correct, xp_earned, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("user_badges").select("badge_id, badges(*)").eq("user_id", user.id),
        supabase
          .from("endless_runs")
          .select("score, longest_streak")
          .eq("user_id", user.id)
          .order("score", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (p) setProfile(p);
      if (ub) setBadges(ub.map((row: any) => row.badges).filter(Boolean));
      if (endless) setEndlessBest(endless);

      // Pick the best run per level: highest correct%, tie-break by most recent
      if (completions) {
        const best: Record<Level, LevelRun | undefined> = {} as Record<Level, LevelRun | undefined>;
        for (const row of completions as LevelRun[]) {
          const lvl = row.level as Level;
          const current = best[lvl];
          const score = row.questions_total ? row.questions_correct / row.questions_total : 0;
          const currentScore = current && current.questions_total
            ? current.questions_correct / current.questions_total
            : -1;
          if (!current || score > currentScore) best[lvl] = row;
        }
        setBestRuns(best);
      }
    })();
  }, [user]);

  const completedLevels = useMemo(
    () => new Set(ALL_LEVELS.filter((l) => bestRuns[l])),
    [bestRuns]
  );
  const allDone = ALL_LEVELS.every((l) => completedLevels.has(l));

  const isUnlocked = (level: Level): boolean => {
    if (level === "easy") return true;
    if (level === "medium") return completedLevels.has("easy");
    return completedLevels.has("medium");
  };

  const buildCertData = (level: Level): CertificateData | null => {
    const run = bestRuns[level];
    if (!run || !profile) return null;
    return {
      kind: "level",
      name: profile.display_name ?? user?.displayName ?? user?.email?.split("@")[0] ?? "Player",
      level,
      correct: run.questions_correct,
      total: run.questions_total,
      xpEarned: run.xp_earned,
      totalXp: profile.total_xp,
    };
  };

  const championCertData = (): CertificateData | null => {
    if (!allDone || !profile) return null;
    return {
      kind: "champion",
      name: profile.display_name ?? user?.displayName ?? user?.email?.split("@")[0] ?? "Champion",
      totalXp: profile.total_xp,
    };
  };

  const openPreview = (cert: CertificateData | null, title: string) => {
    if (!cert) return;
    try {
      const { url } = getCertificatePreviewUrl(cert);
      setPreviewUrl(url);
      setPreviewCert(cert);
      setPreviewTitle(title);
      setPreviewOpen(true);
    } catch (e) {
      console.error("preview error", e);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-primary animate-flicker">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container py-10 space-y-10">
        {/* Profile card */}
        <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-wrap items-center gap-6">
          {profile?.avatar_url && (
            <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full border-2 border-primary shadow-neon-primary" />
          )}
          <div className="flex-1 min-w-[200px]">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back, player</div>
            <h1 className="font-display text-2xl md:text-3xl mt-1 text-neon">
              {profile?.display_name ?? user?.displayName ?? "Adventurer"}
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="text-accent font-display text-lg text-neon-lime">
                {profile?.total_xp ?? 0} XP
              </div>
              <Link to="/leaderboard" className="text-sm text-secondary hover:text-secondary/80 inline-flex items-center gap-1">
                <Trophy className="h-4 w-4" /> View leaderboard
              </Link>
            </div>
          </div>
          {allDone && (
            <Button
              variant="hero"
              size="lg"
              className="gap-2"
              onClick={() => openPreview(championCertData(), "Champion Certificate")}
            >
              <Trophy /> Champion Certificate
            </Button>
          )}
        </div>

        {/* Levels */}
        <div>
          <h2 className="font-display text-xl mb-6 text-neon-cyan">CHOOSE YOUR QUEST</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {ALL_LEVELS.map((level) => {
              const meta = LEVEL_META[level];
              const unlocked = isUnlocked(level);
              const done = completedLevels.has(level);
              return (
                <div
                  key={level}
                  className={`glass-card relative overflow-hidden rounded-2xl p-6 ${unlocked ? "" : "opacity-60"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl">{meta.emoji}</span>
                    {done && <span className="text-xs font-bold uppercase tracking-wider text-success">✓ Cleared</span>}
                    {!unlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className={`font-display text-lg mb-1 text-${meta.color}`}>{meta.label.toUpperCase()}</div>
                  <p className="text-sm text-muted-foreground mb-4">{meta.tagline} · {meta.questions} questions · {meta.xpPerCorrect} XP each</p>

                  {unlocked ? (
                    <Link to={`/quiz/${level}`}>
                      <Button variant={done ? "neon" : "hero"} className="w-full gap-2">
                        <Play className="h-4 w-4" /> {done ? "Replay" : "Start"}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" disabled className="w-full">
                      <Lock className="h-4 w-4" /> Complete previous level
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{completedLevels.size} / 3 levels</span>
            </div>
            <Progress value={(completedLevels.size / 3) * 100} className="h-3" />
          </div>
        </div>

        {/* Endless Mode */}
        <div>
          <h2 className="font-display text-xl mb-6 text-secondary flex items-center gap-2">
            <InfinityIcon /> ENDLESS MODE
          </h2>
          <div
            className={`glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden ${
              allDone ? "border-2 border-secondary/50 shadow-[0_0_30px_hsl(var(--secondary)/0.25)]" : "opacity-80"
            }`}
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="text-6xl">{allDone ? "♾️" : "🔒"}</div>
              <div className="flex-1 min-w-[220px]">
                <div className="font-display text-lg text-neon-cyan mb-1">
                  {allDone ? "MIXED-DIFFICULTY GAUNTLET" : "LOCKED"}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {allDone
                    ? "Survive as long as you can. 3 lives. Mixed easy/medium/hard questions. Timer shrinks the longer you last. Build streaks for massive score multipliers."
                    : "Complete Easy, Medium, and Hard to unlock Endless Mode."}
                </p>
                {allDone && endlessBest && (
                  <div className="flex flex-wrap gap-4 text-xs font-display">
                    <span className="text-neon-lime">BEST SCORE: {endlessBest.score}</span>
                    <span className="text-accent inline-flex items-center gap-1">
                      <Flame className="h-3 w-3" /> LONGEST STREAK: {endlessBest.longest_streak}
                    </span>
                  </div>
                )}
              </div>
              {allDone ? (
                <Link to="/endless">
                  <Button variant="cyan" size="lg" className="gap-2">
                    <InfinityIcon /> {endlessBest ? "Play Again" : "Start Endless"}
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" disabled className="gap-2">
                  <Lock className="h-4 w-4" /> Locked
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Certificate History */}
        <div>
          <h2 className="font-display text-xl mb-6 text-neon-cyan flex items-center gap-2">
            <ScrollText /> CERTIFICATE HISTORY
          </h2>

          {completedLevels.size === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
              Complete a level to earn your first certificate.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {ALL_LEVELS.map((level) => {
                const meta = LEVEL_META[level];
                const run = bestRuns[level];
                const cert = buildCertData(level);
                const percent = run && run.questions_total
                  ? Math.round((run.questions_correct / run.questions_total) * 100)
                  : 0;
                const tierLabel =
                  percent === 100 ? "FLAWLESS" :
                  percent >= 80 ? "GOLD" :
                  percent >= 60 ? "SILVER" :
                  percent >= 40 ? "BRONZE" :
                  run ? "PARTICIPATION" : "—";

                return (
                  <div
                    key={level}
                    className={`glass-card rounded-2xl p-6 flex flex-col ${run ? "" : "opacity-60"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{meta.emoji}</span>
                      <span className={`font-display text-xs px-2 py-1 rounded-full border border-${meta.color}/40 text-${meta.color}`}>
                        {tierLabel}
                      </span>
                    </div>
                    <div className={`font-display text-lg mb-1 text-${meta.color}`}>
                      {meta.label.toUpperCase()} CERTIFICATE
                    </div>
                    {run ? (
                      <p className="text-xs text-muted-foreground mb-4">
                        Best score: {run.questions_correct}/{run.questions_total} ({percent}%) · +{run.xp_earned} XP
                        <br />
                      Earned {new Date(run.created_at).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mb-4">
                        Not yet earned — clear this level to unlock.
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button
                        variant="neon"
                        size="sm"
                        className="flex-1 gap-1"
                        disabled={!cert}
                        onClick={() => openPreview(cert, `${meta.label} Level Certificate`)}
                      >
                        <Sparkles className="h-4 w-4" /> Preview
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        className="flex-1 gap-1"
                        disabled={!cert}
                        onClick={() => cert && downloadCertificate(cert)}
                      >
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Champion certificate card */}
              {allDone && (
                <div className="glass-card rounded-2xl p-6 flex flex-col md:col-span-3 border-2 border-secondary/60 shadow-[0_0_30px_hsl(var(--secondary)/0.35)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl">🏆</span>
                    <span className="font-display text-xs px-2 py-1 rounded-full border border-secondary/50 text-neon-lime">
                      CHAMPION
                    </span>
                  </div>
                  <div className="font-display text-lg mb-1 text-neon-lime">
                    CERTIFICATE OF MASTERY
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Awarded for conquering all three levels · {profile?.total_xp ?? 0} lifetime XP.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="neon"
                      size="sm"
                      className="gap-1"
                      onClick={() => openPreview(championCertData(), "Champion Certificate")}
                    >
                      <Sparkles className="h-4 w-4" /> Preview
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        const c = championCertData();
                        if (c) downloadCertificate(c);
                      }}
                    >
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Badges */}
        <div>
          <h2 className="font-display text-xl mb-6 text-neon-lime flex items-center gap-2">
            <Award /> BADGE COLLECTION
          </h2>
          {badges.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
              No badges yet — start a quest to earn your first one.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
              {badges.map((b) => (
                <div key={b.id} className="glass-card rounded-2xl p-4 text-center hover:shadow-neon-lime transition">
                  <div className="text-4xl mb-2">{b.icon}</div>
                  <div className="font-display text-[10px] text-accent">{b.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{b.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate preview modal (shared) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-background">
          <DialogHeader className="p-5 border-b border-border">
            <DialogTitle className="font-display text-neon-lime">{previewTitle}</DialogTitle>
            <DialogDescription>Preview your certificate before downloading the PDF.</DialogDescription>
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
            <Button
              variant="hero"
              className="gap-2"
              onClick={() => previewCert && downloadCertificate(previewCert)}
            >
              <Download /> Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
