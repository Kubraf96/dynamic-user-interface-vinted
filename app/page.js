"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [showShippingNote, setShowShippingNote] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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
        {["Damer", "Herrer", "Børn", "Hjem", "Elektronik", "Sport", "Underholdning"].map((category) => (
          <button type="button" className={styles.category} key={category}>
            {category}
          </button>
        ))}
      </nav>

      <section className={styles.feed} aria-label="Artikler" aria-busy={isLoading}>
        {Array.from({ length: 8 }, (_, index) => (
          isLoading ? (
            <article className={styles.card} key={index} aria-hidden="true">
              <div className={`${styles.cardImage} ${styles.skeleton}`} />
              <div className={styles.cardInfo}>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineTitle}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineMeta}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLinePrice}`} />
              </div>
            </article>
          ) : (
            <article className={styles.card} key={index}>
              <div className={styles.cardImage}>
                <button type="button" className={styles.favorite} aria-label="Gem artikel">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>
              <div className={styles.cardInfo} />
            </article>
          )
        ))}
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
