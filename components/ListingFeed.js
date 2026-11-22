"use client";

import { useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";

const defaultCategories = [
  "Alle",
  "Kvinder",
  "Mænd",
  "Designerartikler",
  "Børn",
  "Bolig",
  "Elektronik",
  "Bøger og medier",
  "Hobby og samleobjekter",
  "Sport",
];

export default function ListingFeed({ listings, favoriteIds = [], favoriteCounts = {}, showCategories = true, onFavoriteChange, currentUserId = null }) {
  const [activeCategory, setActiveCategory] = useState("Alle");
  const categories = useMemo(() => {
    const fromListings = [...new Set(listings.map((item) => item.category).filter(Boolean))];
    return [...new Set([...defaultCategories, ...fromListings])];
  }, [listings]);
  const visibleListings = activeCategory === "Alle"
    ? listings
    : listings.filter((item) => item.category === activeCategory);

  return (
    <>
      {showCategories && <nav className={styles.categories} aria-label="Kategorier">
        {categories.map((category) => (
          <button
            type="button"
            className={`${styles.category} ${activeCategory === category ? styles.categoryActive : ""}`}
            aria-pressed={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            key={category}
          >
            {category}
          </button>
        ))}
      </nav>}

      {visibleListings.length ? (
        <section className={styles.feed} aria-label="Annoncer">
          {visibleListings.map((listing) => {
            const images = Array.isArray(listing.product_images) ? listing.product_images : [];
            const imageUrl = images[0]?.image_url;
            const price = Number(listing.price) || 0;
            const buyerTotal = price * 1.05 + 5;
            return (
              <article className={styles.card} key={listing.id}>
                <div className={styles.cardImage}>
                  <Link href={`/listing/${listing.id}`} className={styles.imageLink} aria-label={`Åbn annoncen: ${listing.title}`}>
                    {imageUrl ? <img className={styles.listingPhoto} src={imageUrl} alt={listing.title} /> : <div className={styles.noPhoto}>Intet billede</div>}
                  </Link>
                  {listing.seller_id !== currentUserId && <FavoriteButton listingId={listing.id} initialFavorite={favoriteIds.includes(listing.id)} initialCount={favoriteCounts[listing.id] || 0} onChange={onFavoriteChange} />}
                </div>
                <div className={styles.productDetails}>
                  <Link href={`/listing/${listing.id}`} className={styles.title}>{listing.title}</Link>
                  <p>{[listing.size, listing.condition].filter(Boolean).join(" · ")}</p>
                  {listing.status === "sold" && <span className={styles.soldBadge}>Solgt</span>}
                  <p className={styles.productPrice}>{price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.</p>
                  <p className={styles.productTotal}>{buyerTotal.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. inkl. <img src="/home/shield-check.svg" alt="" /></p>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <p className={styles.emptyCategory}>Der er ingen annoncer i denne kategori endnu.</p>
      )}
    </>
  );
}
