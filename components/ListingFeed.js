"use client";

import { useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import { ADMIN_USER_ID } from "@/lib/listing-access";

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

function sellerName(listing) {
  const profile = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
  return profile?.username || profile?.full_name || (listing.seller_id === ADMIN_USER_ID ? "Mariaskov12" : "Vinted-medlem");
}

export default function ListingFeed({ listings }) {
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
      <nav className={styles.categories} aria-label="Kategorier">
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
      </nav>

      {visibleListings.length ? (
        <section className={styles.feed} aria-label="Annoncer">
          {visibleListings.map((listing) => {
            const images = Array.isArray(listing.product_images) ? listing.product_images : [];
            const imageUrl = images[0]?.image_url;
            return (
              <article className={styles.card} key={listing.id}>
                <div className={styles.cardImage}>
                  {imageUrl ? (
                    <img className={styles.listingPhoto} src={imageUrl} alt={listing.title} />
                  ) : (
                    <div className={styles.noPhoto}>Intet billede</div>
                  )}
                </div>
                <div className={styles.productDetails}>
                  <p className={styles.seller}>{sellerName(listing)}</p>
                  <p className={styles.title}>{listing.title}</p>
                  <p>{[listing.brand, listing.size, listing.condition].filter(Boolean).join(" · ")}</p>
                  <p className={styles.productPrice}>{Number(listing.price).toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</p>
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
