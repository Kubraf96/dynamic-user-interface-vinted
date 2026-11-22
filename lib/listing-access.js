// Maria's Supabase Auth user ID. Keep this in sync with the admin UUID in
// supabase/listings-rls.sql. RLS remains the authority for database writes.
export const ADMIN_USER_ID = "ba74304a-d99e-4055-b1f2-bf55a9a94270";

export function isAdmin(userId) {
  return userId === ADMIN_USER_ID;
}
