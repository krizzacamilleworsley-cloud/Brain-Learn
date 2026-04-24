-- Endless Mode runs
CREATE TABLE public.endless_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.endless_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Endless runs viewable by everyone"
ON public.endless_runs FOR SELECT USING (true);

CREATE POLICY "Users insert own endless runs"
ON public.endless_runs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_endless_runs_user_score
  ON public.endless_runs (user_id, score DESC);

CREATE INDEX idx_endless_runs_score
  ON public.endless_runs (score DESC);

-- Leaderboard view: each player's best endless run
CREATE OR REPLACE VIEW public.endless_leaderboard
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.display_name,
  p.avatar_url,
  COALESCE(MAX(r.score), 0) AS best_score,
  COALESCE(MAX(r.longest_streak), 0) AS best_streak,
  COUNT(r.id) AS runs_played
FROM public.profiles p
JOIN public.endless_runs r ON r.user_id = p.id
GROUP BY p.id, p.display_name, p.avatar_url;

-- Endless badge
INSERT INTO public.badges (code, name, description, icon)
VALUES ('endless_initiate', 'Endless Initiate', 'Played your first Endless Mode run', '♾️')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.badges (code, name, description, icon)
VALUES ('endless_streak_10', 'Streak Slayer', 'Hit a 10-answer streak in Endless Mode', '🔥')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.badges (code, name, description, icon)
VALUES ('endless_streak_25', 'Unstoppable', 'Hit a 25-answer streak in Endless Mode', '⚡')
ON CONFLICT (code) DO NOTHING;