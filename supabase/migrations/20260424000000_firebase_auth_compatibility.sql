Migriont makdaabasecmpatible string IDssrgIDsli"fZkQqRbEVPuqZisKUdNASFA2"ntadfUUIDFist, drfregn kyconsrinsarggersTRGGERon_auth_u_eadathusrFUNTIONpublic.handle_new_u();

-- Drop exitingtblesto recreithprtypes
DRPVIEW IF EXISTS aderboardVEWndessaderbardTABETABEpublc.lvel_compleis;
DROPTABLE IF EXISTS public._;
DRPTABLE IF EXISTS profiRecrflbewi tx ID to mchFiebse Auh
CREATE TABLE publc.prfile ( id xtPRMARYKEY, -- Chngedfm udtextfFirebae Auth cmatbiliy
  dsply_name xt,
 vatar_rl ext,
 mail text, ttal_xpiteger NOT NULL DEFAULT 0
 currnt_evetextNOT NULL DEFAULT 'es',
 cred_a tmestmpzNOT NULL DEFAULT now(),
  pdatd_atiestmptz NOT NULL DEFAULT ow()
);

ALTER TABLEpublc.pofiles ENABLE ROWLEVELSECURITY;CREATE POLICY" are viewable by everyone"
  ONub.profl FOR SELECT USING (true);Usrs ownauh.id() = idUsrs ownauh.id() = id Recreate level_completions table with text user_id
CREATETABE public.l_ions (
  id uud PRIMARY KEY DEFAULT gen_randm_uuid(),
  user_id text NOT NULL, -- Chaged from uuid to text
  level text NOT NULL CHECK (level IN ('easy','medium','hard')),
  core integer NOT NULL DEFAULT 0,
 x_earned integer NOT NULL DEFAULT 0,
  questions_tta integer NOT NULL DEFAULT 0,
  questions_correct nteger NOT NULL DEFAULT 0,
  ompleted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE publc.level_compltion ENABLE ROWLEVELSECURITY;
Completios viewable by ever"
  ONpublic.level_ompletios FOR SELECT USING (true);
CREATE POLICY "Users ownauh.uid() = sr_id Recreate user_badges table with text user_id
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEYDEFALT gen_random_uuid(),
  uer_id text NOT NULL, -- Changd fomuuid to text
  _id uuid NOT NULL REFERENCES public.badge(id)ON DELETE CASCADE,
  earned_at timestamtz NOT NULL DEFAULT nw(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE pub.usr_badge ENABLE ROW LEVEL SECURITY;
User badges viewable b every"
ON publc.u_badges FOR SELECT USING (rue);
CREATEPOLICY "Users can earn own auh.id() = usr_idRecreate e_table with text user_id
CREATE TABLE ub.ndles_runs
  d uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL, -- Changed rom uuid to text
  score integer NOT NULL DEFAULT 0,
 quesions_nswered integer NOT NULL DEFAULT 0,
  questions_corrctintegr NOT NULL DEFAULT 0,
  p_earned nteger NOT NULL DEFAULT 0,
  longest_treak integer NOT NULL DEFAULT 0,
  created_at imetamptz NOT NULL DEFAULT now()
;

ALTER TABLE public.endless_runs ENABLE ROW LEVEL SECURITY;
Endless rus viewable by ever"
  ONpubli.endless_rus FOR SELECT USING (true);
CREATE POLICY "Users ownauh.uid() = sr_id
CREATE INDEX idx_endless_runs_user_score O public.endless_runs (user_id, scrDESC);
CREAE INDEX dx_endles_runs_score
 ON publc.endles_runs(score DESC);

-- Recreteupdad_at trigger
CREATE OR REPLACE FUNCTION ublic.tuch_updted_at()
RETURNS tiggerLANGUAGE plpgq AS $$
BEGIN 
  new.pdaed_at = nw(); 
  return ew; 
END;
$$;

CREATE TRIGGERproiles_tuch
 BEORE UPDATE ON publc.pofil
  FORECH ROW EXECUTE FUNCTION pblic.ouc_updated_at();

--Reree leaderoard vewsCREATE OR REPLACEVEWublic.leadebar
WITH (secriy_nvker =tre) AS
SELECTi,dsay_na, avatar_url, total_xp, curre_level
FROMublic.pfils
ORDERBY tta_xp DESC;

CREATE OR REPLACE VIEW public.ndlss_eaderboard
WITH(_invoker = true) ASSELECT
 p.id,
  p.display_name,
  p.avar_url,
  COALESCE(MAX(r.score), 0) AS best_score,
  COALESCE(MAX(r.longest_sreak), 0) ASbest_strek,
  COUNT(r.) AS runs_plyd
FROMpublc.pofil p
LEFTOINpublic.endlss_ru ONr.r_id = p.id
GROUP BYp.id,p.splay_nam, p.avaar_url
HAVINGCOUNT(.id) > 0
ORDER BY best_scre DESC;