import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ListingFeed from "../components/ListingFeed.js";
import styles from "./page.module.css";

export const metadata = { title: "Hjem | Vinted" };

export default async function Home({ searchParams }) {
  const { search = "" } = await searchParams;
  const searchTerm = typeof search === "string" ? search.trim() : "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from("listings")
    .select("id,seller_id,title,description,price,brand,size,condition,category,status,created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (user) query = query.neq("seller_id", user.id);
  if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);
  const { data: listingRows, error: listingError } = await query;

  let listings = listingRows || [];
  let error = listingError;
  let favoriteIds = [];
  let favoriteCounts = {};

  if (!error && listings.length) {
    const listingIds = listings.map(({ id }) => id);
    const sellerIds = [...new Set(listings.map(({ seller_id }) => seller_id))];
    const [imageResult, profileResult, favoriteResult, countsResult] = await Promise.all([
      supabase.from("product_images").select("listing_id,image_url").in("listing_id", listingIds),
      supabase.from("profiles").select("id,username,full_name,avatar_url").in("id", sellerIds),
      user ? supabase.from("favorites").select("listing_id").eq("user_id", user.id).in("listing_id", listingIds) : Promise.resolve({ data: [] }),
      supabase.rpc("get_listing_favorite_counts", { listing_ids: listingIds }),
    ]);
    error = imageResult.error || profileResult.error;
    if (!error) {
      const profiles = new Map((profileResult.data || []).map((profile) => [profile.id, profile]));
      const imageMap = new Map();
      for (const image of imageResult.data || []) {
        const rows = imageMap.get(image.listing_id) || [];
        rows.push(image);
        imageMap.set(image.listing_id, rows);
      }
      listings = listings.map((listing) => ({
        ...listing,
        profiles: profiles.get(listing.seller_id) || null,
        product_images: imageMap.get(listing.id) || [],
      }));
      favoriteIds = (favoriteResult.data || []).map(({ listing_id }) => listing_id);
      favoriteCounts = Object.fromEntries((countsResult.data || []).map(({ listing_id, favorite_count }) => [listing_id, Number(favorite_count)]));
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.searchSection} aria-label="Søg">
        <form className={styles.searchForm} action="/">
          <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
          <label className={styles.visuallyHidden} htmlFor="search">Søg efter annoncer</label>
          <input id="search" name="search" type="search" defaultValue={searchTerm} placeholder="Søg efter artikler eller medlemmer" />
          <button className={styles.cameraButton} type="button" aria-label="Søg med billede">⌕</button>
        </form>
      </section>

      {error ? (
        <section className={styles.emptyState} role="alert">
          <h2>Annoncerne kunne ikke hentes</h2>
          <p>Kontrollér Supabase RLS-politikkerne for listings, profiles og product_images.</p>
          {process.env.NODE_ENV === "development" && <pre className={styles.debugError}>{error.code ? `${error.code}: ` : ""}{error.message}</pre>}
        </section>
      ) : listings.length ? (
        <ListingFeed listings={listings} favoriteIds={favoriteIds} favoriteCounts={favoriteCounts} currentUserId={user?.id || null} />
      ) : (
        <section className={styles.emptyState}>
          <h2>Der er ingen aktive annoncer endnu</h2>
          <p>{user ? "Her vises aktive annoncer fra andre medlemmer." : "Log ind, og opret den første annonce."}</p>
          <Link className={styles.sellLink} href={user ? "/sell" : "/login"}>{user ? "Opret en annonce" : "Log ind"}</Link>
        </section>
      )}
    </main>
  );
}
