import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ListingFeed from "@/components/ListingFeed";
import styles from "./page.module.css";

export const metadata = { title: "Hjem | Vinted" };

export default async function Home({ searchParams }) {
  const { search = "" } = await searchParams;
  const searchTerm = typeof search === "string" ? search.trim() : "";
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      "id, seller_id, title, description, price, brand, size, condition, category, status, created_at",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);
  const { data: listingRows, error: listingError } = await query;

  let listings = listingRows || [];
  let error = listingError;

  if (!error && listings.length) {
    const listingIds = listings.map(({ id }) => id);
    const sellerIds = [...new Set(listings.map(({ seller_id }) => seller_id).filter(Boolean))];
    const [profilesResult, imagesResult] = await Promise.all([
      sellerIds.length
        ? supabase.from("profiles").select("id, username, full_name").in("id", sellerIds)
        : Promise.resolve({ data: [], error: null }),
      supabase.from("product_images").select("listing_id, image_url").in("listing_id", listingIds),
    ]);

    error = profilesResult.error || imagesResult.error;
    if (!error) {
      const profilesById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
      const imagesByListing = new Map();
      for (const image of imagesResult.data || []) {
        const current = imagesByListing.get(image.listing_id) || [];
        current.push(image);
        imagesByListing.set(image.listing_id, current);
      }
      listings = listings.map((listing) => ({
        ...listing,
        profiles: profilesById.get(listing.seller_id) || null,
        product_images: imagesByListing.get(listing.id) || [],
      }));
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.searchSection} aria-label="Søg">
        <form className={styles.searchForm} action="/">
          <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5L21 21" />
          </svg>
          <label className={styles.visuallyHidden} htmlFor="search">Søg efter annoncer</label>
          <input id="search" name="search" type="search" placeholder="Søg efter artikler eller medlemmer" />
          <button className={styles.cameraButton} type="button" aria-label="Søg med billede">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.5 7.5L9 5.5h6l1.5 2H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2.5z" />
              <circle cx="12" cy="13" r="3.25" />
            </svg>
          </button>
        </form>
      </section>

      {error ? (
        <section className={styles.emptyState} role="alert">
          <h2>Annoncerne kunne ikke hentes</h2>
          <p>Kontrollér, at RLS-politikkerne for listings, profiles og product_images er sat op i Supabase.</p>
          {process.env.NODE_ENV === "development" && (
            <pre className={styles.debugError}>{error.code ? `${error.code}: ` : ""}{error.message}</pre>
          )}
        </section>
      ) : listings?.length ? (
        <ListingFeed listings={listings} />
      ) : (
        <section className={styles.emptyState}>
          <h2>Der er ingen annoncer endnu</h2>
          <p>Opret den første annonce, så bliver den vist her for alle.</p>
          <Link className={styles.sellLink} href="/sell">Opret en annonce</Link>
        </section>
      )}

      <aside className={styles.shippingNote} role="note">
        <span>Fragtgebyrer vil blive tilføjet ved betaling.</span>
      </aside>
    </main>
  );
}
