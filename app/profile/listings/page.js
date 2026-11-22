import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/listing-access";
import ManageListings from "@/components/ManageListings";
import styles from "./page.module.css";

export const metadata = { title: "Mine annoncer | Vinted" };

export default async function MyListingsPage({ searchParams }) {
  const { error, saved, deleted } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnTo=%2Fprofile%2Flistings");

  let query = supabase.from("listings").select("id,title,description,price,status,created_at").order("created_at", { ascending: false });
  if (!isAdmin(user.id)) query = query.eq("seller_id", user.id);
  const { data: listings, error: loadError } = await query;

  return (
    <main className={styles.page}>
      <h1>{isAdmin(user.id) ? "Alle annoncer" : "Mine annoncer"}</h1>
      {error && <p className={styles.message} role="alert">Ændringen kunne ikke gemmes. Kontrollér RLS-politikkerne.</p>}
      {saved && <p className={styles.message}>Annoncen er opdateret.</p>}
      {loadError && <p className={styles.message} role="alert">Annoncerne kunne ikke hentes. Kontrollér RLS-politikken for listings.</p>}
      {!loadError && <ManageListings initialListings={listings || []} />}
    </main>
  );
}
