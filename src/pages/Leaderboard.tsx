import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trophy, Crown, Infinity as InfinityIcon, Flame } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { LEVEL_META, type Level } from "@/lib/levels";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface XpRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_level: string;
}

interface EndlessRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  best_score: number;
  best_streak: number;
  runs_played: number;
}

const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

const Leaderboard = () => {
  const [params, setParams] = useSearchParams();
  const initialTab = params.get("tab") === "endless" ? "endless" : "xp";
  const [tab, setTab] = useState<"xp" | "endless">(initialTab);
  const [xpRows, setXpRows] = useState<XpRow[]>([]);
  const [endlessRows, setEndlessRows] = useState<EndlessRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("leaderboard").select("*").limit(50),
      supabase
        .from("endless_leaderboard" as any)
        .select("*")
        .order("best_score", { ascending: false })
        .limit(50),
    ]).then(([xp, endless]) => {
      setXpRows((xp.data as XpRow[]) ?? []);
      setEndlessRows(((endless.data as unknown) as EndlessRow[]) ?? []);
      setLoading(false);
    });
  }, []);

  const onTabChange = (v: string) => {
    setTab(v as "xp" | "endless");
    setParams(v === "endless" ? { tab: "endless" } : {});
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container py-12 max-w-3xl">
        <div className="text-center mb-10">
          <Crown className="mx-auto h-12 w-12 text-accent animate-float-y" />
          <h1 className="font-display text-3xl md:text-4xl text-neon-lime mt-4">LEADERBOARD</h1>
          <p className="text-muted-foreground mt-2">The top minds in the arcade.</p>
        </div>

        <Tabs value={tab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 w-full">
            <TabsTrigger value="xp" className="gap-2">
              <Trophy className="h-4 w-4" /> Total XP
            </TabsTrigger>
            <TabsTrigger value="endless" className="gap-2">
              <InfinityIcon className="h-4 w-4" /> Endless
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp">
            {loading ? (
              <div className="text-center font-display text-primary animate-flicker">LOADING...</div>
            ) : xpRows.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
                No champions yet — be the first.
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-2 md:p-4 divide-y divide-border">
                {xpRows.map((r, i) => {
                  const lvlMeta = LEVEL_META[r.current_level as Level] ?? LEVEL_META.easy;
                  return (
                    <div key={r.id} className="flex items-center gap-4 px-4 py-4">
                      <div className="font-display text-lg w-12 text-center">{medal(i)}</div>
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt="" className="h-10 w-10 rounded-full border border-border" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{r.display_name ?? "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">
                          {lvlMeta.emoji} on {lvlMeta.label}
                        </div>
                      </div>
                      <div className="font-display text-sm text-neon-lime flex items-center gap-1">
                        <Trophy className="h-4 w-4" /> {r.total_xp}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="endless">
            {loading ? (
              <div className="text-center font-display text-secondary animate-flicker">LOADING...</div>
            ) : endlessRows.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
                No Endless runs yet — clear all 3 levels and be the first to set a high score.
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-2 md:p-4 divide-y divide-border">
                {endlessRows.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-4 px-4 py-4">
                    <div className="font-display text-lg w-12 text-center">{medal(i)}</div>
                    {r.avatar_url ? (
                      <img src={r.avatar_url} alt="" className="h-10 w-10 rounded-full border border-border" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{r.display_name ?? "Anonymous"}</div>
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3 w-3 text-accent" /> {r.best_streak} streak
                        </span>
                        <span>· {r.runs_played} runs</span>
                      </div>
                    </div>
                    <div className="font-display text-sm text-secondary flex items-center gap-1">
                      <InfinityIcon className="h-4 w-4" /> {r.best_score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;
