import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ListingFeed from "../../../components/ListingFeed.js";
import styles from "./page.module.css";

export async function generateMetadata({ params }) {
  const { section } = await params;
  return { title: section === "listings" ? "Mine annoncer" : "Favoritartikler" };
}

export default async function ProfileSectionPage({ params }) {
  const { section } = await params;
  if (section !== "listings" && section !== "favorites") notFound();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  let listingIds = [];
  let queryError = null;
  if (section === "listings") {
    const { data, error } = await supabase.from("listings").select("id").eq("seller_id", user.sub).eq("status", "active");
    listingIds = (data || []).map(({ id }) => id);
    queryError = error;
  } else {
    const { data, error } = await supabase.from("favorites").select("listing_id").eq("user_id", user.sub);
    listingIds = (data || []).map(({ listing_id }) => listing_id);
    queryError = error;
  }

  let listings = [];
  if (!queryError && listingIds.length) {
    const [{ data, error }, { data: favoriteRows }] = await Promise.all([
      supabase.from("listings").select("id,seller_id,title,description,price,brand,size,condition,category,status,created_at").in("id", listingIds).eq("status", "active").order("created_at", { ascending: false }),
      supabase.from("favorites").select("listing_id").eq("user_id", user.sub).in("listing_id", listingIds),
    ]);
    queryError = error;
    if (data?.length) {
      const ids = data.map(({ id }) => id);
      const sellers = [...new Set(data.map(({ seller_id }) => seller_id))];
      const [images, profiles] = await Promise.all([
        supabase.from("product_images").select("listing_id,image_url").in("listing_id", ids),
        supabase.from("profiles").select("id,username,full_name,avatar_url").in("id", sellers),
      ]);
      queryError = images.error || profiles.error;
      const imageMap = new Map();
      for (const row of images.data || []) imageMap.set(row.listing_id, [...(imageMap.get(row.listing_id) || []), row]);
      const profileMap = new Map((profiles.data || []).map((profile) => [profile.id, profile]));
      listings = data.map((row) => ({ ...row, profiles: profileMap.get(row.seller_id) || null, product_images: imageMap.get(row.id) || [] }));
    }
    listingIds = (favoriteRows || []).map(({ listing_id }) => listing_id);
  }

  const heading = section === "listings" ? "Mine annoncer" : "Favoritartikler";
  return <main className={styles.page}>
    <Link className={styles.back} href="/profile">‹ Profil</Link>
    <h1>{heading}</h1>
    {queryError ? <p className={styles.message} role="alert">Kunne ikke hente indholdet. Kontrollér RLS-politikkerne i Supabase.</p>
      : listings.length ? <ListingFeed listings={listings} favoriteIds={listingIds} currentUserId={user.sub} />
        : <p className={styles.message}>{section === "listings" ? "Du har ikke oprettet aktive annoncer endnu." : "Du har ikke gemt nogen favoritartikler endnu."}</p>}
  </main>;
}
