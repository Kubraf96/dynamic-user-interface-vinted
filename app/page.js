"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const categories = ["Alle", "Kvinder", "Mænd", "Designerartikler", "Børn"];

// All four listing photos come from one Figma image; each card shows its own crop of it.
const products = [
  { id: "na-kd-strik", brand: "NA-KD", details: "XS · Meget god", price: "25,00 kr.", total: "31,25 kr. inkl.", favorites: 23, crop: { left: "-4.22%", top: "-56.97%" } },
  { id: "nelly-jeans", brand: "Nelly", details: "EU 36 · Meget god", price: "35,00 kr.", total: "41,75 kr. inkl.", favorites: 15, crop: { left: "-108.1%", top: "-56.97%" } },
  { id: "navy-trøje", crop: { left: "-4.22%", top: "-189.42%" } },
  { id: "grå-bukser", crop: { left: "-108.1%", top: "-189.42%" } },
];

export default function Home() {
  const [showShippingNote, setShowShippingNote] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [liked, setLiked] = useState({});

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.searchSection} aria-label="Søg">
        <form className={styles.searchForm}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5L21 21" />
          </svg>
          <label className={styles.visuallyHidden} htmlFor="search">Søg efter artikler eller medlemmer</label>
          <input id="search" name="search" type="search" placeholder="Søg efter artikler eller medlemmer" />
          <button className={styles.cameraButton} type="button" aria-label="Søg med billede">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.5 7.5L9 5.5h6l1.5 2H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2.5z" />
              <circle cx="12" cy="13" r="3.25" />
            </svg>
          </button>
        </form>
      </section>

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

      <section className={styles.feed} aria-label="Artikler" aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <article className={styles.card} key={index} aria-hidden="true">
                <div className={`${styles.cardImage} ${styles.skeleton}`} />
                <div className={styles.cardInfo}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonLineTitle}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonLineMeta}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonLinePrice}`} />
                </div>
              </article>
            ))
          : products.map((product) => {
              const isLiked = Boolean(liked[product.id]);

              return (
                <article className={styles.card} key={product.id}>
                  <div className={styles.cardImage}>
                    <img className={styles.listingPhoto} style={product.crop} src="/home/listings.png" alt="" />
                    {product.favorites !== undefined && (
                      <button
                        type="button"
                        className={`${styles.favorite} ${isLiked ? styles.favoriteActive : ""}`}
                        aria-pressed={isLiked}
                        aria-label={isLiked ? "Fjern fra favoritter" : "Gem artikel"}
                        onClick={() => setLiked((current) => ({ ...current, [product.id]: !isLiked }))}
                      >
                        <img src="/home/heart.svg" alt="" width="18.2488" height="18.2488" />
                        <span>{product.favorites + (isLiked ? 1 : 0)}</span>
                      </button>
                    )}
                  </div>
                  {product.brand && (
                    <div className={styles.productDetails}>
                      <p>{product.brand}</p>
                      <p>{product.details}</p>
                      <p className={styles.productPrice}>{product.price}</p>
                      <p className={styles.productTotal}>
                        {product.total}
                        <img src="/home/shield-check.svg" alt="Køberbeskyttelse" width="13.1391" height="13.1391" />
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
      </section>

      {showShippingNote && (
        <aside className={styles.shippingNote} role="note">
          <span>Fragtgebyrer vil blive tilføjet ved betaling.</span>
          <button
            type="button"
            aria-label="Luk besked"
            onClick={() => setShowShippingNote(false)}
          >
            ×
          </button>
        </aside>
      )}
    </main>
  );
}
