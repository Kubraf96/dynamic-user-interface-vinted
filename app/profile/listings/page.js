import Link from "next/link";
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

  let query = supabase.from("listings").select("id,title,description,price,status,category,brand,size,condition,created_at,seller_id").order("created_at", { ascending: false });
  if (!isAdmin(user.id)) query = query.eq("seller_id", user.id);
  const { data: listings, error: loadError } = await query;
  const listingIds = (listings || []).map(({ id }) => id);
  const [{ data: profile }, { data: imageRows, error: imageError }] = await Promise.all([
    supabase.from("profiles").select("username,full_name").eq("id", user.id).maybeSingle(),
    listingIds.length ? supabase.from("product_images").select("listing_id,image_url").in("listing_id", listingIds) : Promise.resolve({ data: [], error: null }),
  ]);
  const imagesByListing = new Map();
  for (const image of imageRows || []) {
    const current = imagesByListing.get(image.listing_id) || [];
    current.push(image.image_url);
    imagesByListing.set(image.listing_id, current);
  }
  const items = (listings || []).map((listing) => ({ ...listing, imageUrls: imagesByListing.get(listing.id) || [] }));
  const displayName = profile?.username || profile?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Medlem";

  return (
    <main className={styles.page}>
      <header className={styles.profileHeader}>
        <Link href="/profile" className={styles.back} aria-label="Tilbage til profil"><img src="/arrow-icon.svg" alt="" /></Link>
        <h1>{displayName}</h1>
        <button type="button" className={styles.more} aria-label="Flere muligheder">•••</button>
      </header>
      <nav className={styles.tabs} aria-label="Profil"><a className={styles.activeTab} href="#opslag">Opslag</a><a href="#omtaler">Omtaler</a><a href="#om">Om</a></nav>
      {error && <p className={styles.message} role="alert">Ændringen kunne ikke gemmes. Kontrollér RLS-politikkerne.</p>}
      {saved && <p className={styles.success} role="status">Annoncen er opdateret.</p>}
      {deleted && <p className={styles.success} role="status">Annoncen er slettet.</p>}
      {(loadError || imageError) && <p className={styles.message} role="alert">Annoncerne eller billederne kunne ikke hentes. Kontrollér RLS-politikkerne.</p>}
      {!loadError && !imageError && <ManageListings initialListings={items} />}
    </main>
  );
}
