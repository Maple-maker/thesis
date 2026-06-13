-- Tier protection — users can update their own row (profile, themes,
-- onboarding) but must never be able to self-escalate tier to 'pro'.
-- Only service_role (billing webhooks / admin) may change tier.

-- Blocks tier changes only for end-user API roles ('authenticated'/'anon').
-- Dashboard SQL (NULL role) and service_role can still manage tier.
CREATE OR REPLACE FUNCTION public.protect_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.role() IN ('authenticated', 'anon') THEN
      NEW.tier := 'free';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.tier IS DISTINCT FROM OLD.tier
     AND auth.role() IN ('authenticated', 'anon') THEN
    NEW.tier := OLD.tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS protect_tier_update ON public.users;
CREATE TRIGGER protect_tier_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_tier();

DROP TRIGGER IF EXISTS protect_tier_insert ON public.users;
CREATE TRIGGER protect_tier_insert
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_tier();

-- Hardening (advisor lints): pin search_path on SECURITY DEFINER trigger
-- functions and remove public RPC executability — they are trigger-only.
ALTER FUNCTION public.protect_user_tier() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.protect_user_tier() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public;
