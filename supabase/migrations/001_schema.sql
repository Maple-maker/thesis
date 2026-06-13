-- Thesis — complete database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query → paste → Run)

-- ============================================================
-- USERS — extended from Supabase Auth
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  profile JSONB NOT NULL DEFAULT '{}',
  theme_ids TEXT[] DEFAULT '{}',
  onboarding_state TEXT NOT NULL DEFAULT 'not-started'
    CHECK (onboarding_state IN ('not-started', 'in-progress', 'complete'))
);

-- Auto-create a users row when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DECISIONS — polymorphic: duels + portfolio holdings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('duel', 'portfolio_add', 'portfolio_remove')),
  data JSONB NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_decisions_user ON public.decisions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_type ON public.decisions (user_id, type);

-- ============================================================
-- CONTEXT_CACHE — AI advisor memory blob (one per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.context_cache (
  user_id UUID PRIMARY KEY REFERENCES public.users ON DELETE CASCADE,
  context_blob JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHAT_HISTORY — Pro only, advisor conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  topic TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_user ON public.chat_history (user_id, created_at DESC);

-- ============================================================
-- PRICE_CACHE — server-side, not per-user
-- ============================================================
CREATE TABLE IF NOT EXISTS public.price_cache (
  symbol TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY — every table locked down
-- ============================================================

-- Users: own row only
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Decisions: own rows only
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decisions_select_own" ON public.decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "decisions_insert_own" ON public.decisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decisions_update_own" ON public.decisions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "decisions_delete_own" ON public.decisions FOR DELETE USING (auth.uid() = user_id);

-- Context cache: own row only
ALTER TABLE public.context_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "context_select_own" ON public.context_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "context_upsert_own" ON public.context_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "context_update_own" ON public.context_cache FOR UPDATE USING (auth.uid() = user_id);

-- Chat history: own rows only
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_select_own" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_insert_own" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Price cache: any authenticated user can read (not user data)
ALTER TABLE public.price_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_read_all" ON public.price_cache FOR SELECT USING (auth.role() = 'authenticated');
-- Only service_role can write to price_cache (Edge Functions use service_role)
CREATE POLICY "price_write_service" ON public.price_cache FOR ALL USING (auth.role() = 'service_role');
