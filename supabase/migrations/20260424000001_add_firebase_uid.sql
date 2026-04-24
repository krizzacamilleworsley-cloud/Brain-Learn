-- Add firebase_uid column to existing tables to support Firebase Auth
-- This is a minimal change that doesn't break existing UUID structure

-- Add firebase_uid column to profiles table
ALTER TABLE public.profiles ADD COLUMN firebase_uid text UNIQUE;

-- Add firebase_uid column to level_completions table  
ALTER TABLE public.level_completions ADD COLUMN firebase_uid text;

-- Add firebase_uid column to user_badges table
ALTER TABLE public.user_badges ADD COLUMN firebase_uid text;

-- Add firebase_uid column to endless_runs table
ALTER TABLE public.endless_runs ADD COLUMN firebase_uid text;

-- Create indexes for better performance
CREATE INDEX idx_profiles_firebase_uid ON public.profiles(firebase_uid);
CREATE INDEX idx_level_completions_firebase_uid ON public.level_completions(firebase_uid);
CREATE INDEX idx_user_badges_firebase_uid ON public.user_badges(firebase_uid);
CREATE INDEX idx_endless_runs_firebase_uid ON public.endless_runs(firebase_uid);

-- Update RLS policies to also check firebase_uid
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR auth.uid()::text = firebase_uid);

DROP POLICY IF EXISTS "Users insert own completions" ON public.level_completions;
CREATE POLICY "Users insert own completions" 
  ON public.level_completions FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid()::text = firebase_uid);

DROP POLICY IF EXISTS "Users can earn own badges" ON public.user_badges;
CREATE POLICY "Users can earn own badges" 
  ON public.user_badges FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid()::text = firebase_uid);

DROP POLICY IF EXISTS "Users insert own endless runs" ON public.endless_runs;
CREATE POLICY "Users insert own endless runs" 
  ON public.endless_runs FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid()::text = firebase_uid);