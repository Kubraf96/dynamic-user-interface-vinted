-- Remove only the profile trigger added by the earlier listings setup script.
-- Leave any other existing Auth triggers untouched.
drop trigger if exists create_profile_after_auth_signup on auth.users;
drop function if exists public.create_profile_for_auth_user();
