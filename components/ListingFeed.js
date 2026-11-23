"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FavoriteButton from "./FavoriteButton.js";
import styles from "../app/page.module.css";

const defaultCategories = ["Alle", "Kvinder", "Mænd", "Designerartikler", "Børn", "Bolig", "Elektronik", "Bøger og medier", "Hobby og samleobjekter", "Sport"];

export default function ListingFeed({ listings, favoriteIds = [], favoriteCounts = {}, currentUserId = null }) {
  const [activeCategory, setActiveCategory] = useState("Alle");
  const categories = useMemo(() => [...new Set([...defaultCategories, ...listings.map((item) => item.category).filter(Boolean)])], [listings]);
  const visibleListings = activeCategory === "Alle" ? listings : listings.filter((item) => item.category === activeCategory);

  return <>
    <nav className={styles.categories} aria-label="Kategorier">
      {categories.map((category) => <button type="button" key={category} className={`${styles.category} ${activeCategory === category ? styles.categoryActive : ""}`} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}
    </nav>
    {visibleListings.length ? <section className={styles.feed} aria-label="Annoncer">
      {visibleListings.map((listing) => {
        const image = listing.product_images?.[0]?.image_url;
        const price = Number(listing.price) || 0;
        const buyerTotal = price * 1.05 + 5;
        const username = listing.profiles?.username || listing.profiles?.full_name || "Vinted-medlem";
        return <article className={styles.card} key={listing.id}>
          <div className={styles.cardImage}>
            <Link href={`/listing/${listing.id}`} className={styles.imageLink} aria-label={`Se ${listing.title}`}>
              {image ? <img className={styles.listingPhoto} src={image} alt={listing.title} /> : <span className={styles.noPhoto}>Intet billede</span>}
            </Link>
            {listing.seller_id !== currentUserId && <FavoriteButton listingId={listing.id} initialFavorite={favoriteIds.includes(listing.id)} initialCount={favoriteCounts[listing.id] || 0} />}
          </div>
          <div className={styles.productDetails}>
            <Link href={`/listing/${listing.id}`} className={styles.productTitle}>{listing.title}</Link>
            <p>{[listing.size, listing.condition].filter(Boolean).join(" · ")}</p>
            <p className={styles.sellerName}>@{username}</p>
            <p className={styles.productPrice}>{price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.</p>
            <p className={styles.productTotal}>{buyerTotal.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. inkl. køberbeskyttelse <img src="/home/shield-check.svg" alt="" /></p>
          </div>
        </article>;
      })}
    </section> : <p className={styles.emptyCategory}>Der er ingen annoncer i denne kategori endnu.</p>}
  </>;
}
