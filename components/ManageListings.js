"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "@/app/profile/listings/page.module.css";

const filters = [
  { id: "all", label: "Alle" },
  { id: "active", label: "Aktiv" },
  { id: "reserved", label: "Reserveret" },
  { id: "sold", label: "Solgt" },
  { id: "hidden", label: "Skjult" },
];

export default function ManageListings({ initialListings }) {
  const [listings, setListings] = useState(initialListings);
  const [filter, setFilter] = useState("active");
  const [message, setMessage] = useState("");
  const visibleListings = useMemo(
    () => filter === "all" ? listings : listings.filter((listing) => listing.status === filter),
    [filter, listings],
  );

  return (
    <section id="opslag" className={styles.content}>
      <button className={styles.boostBanner} type="button" onClick={() => setMessage("Boost bliver snart tilgængeligt.")}>
        <span><strong>Boost din synlighed</strong><br />Gør reklame for dine artikler. Øg dine chancer for at sælge.</span>
        <span className={styles.chevron} aria-hidden="true">›</span>
      </button>
      {message && <p className={styles.message} role="status">{message}</p>}
      <h2>{listings.length} {listings.length === 1 ? "artikel" : "artikler"}</h2>
      <div className={styles.filters} aria-label="Filtrer annoncer">
        {filters.map((item) => <button key={item.id} type="button" className={filter === item.id ? styles.selectedFilter : ""} onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>
      {!visibleListings.length && <p className={styles.empty}>Der er ingen annoncer i denne kategori.</p>}
      <div className={styles.grid}>
        {visibleListings.map((listing) => (
          <article className={styles.card} key={listing.id}>
            <Link className={styles.productLink} href={`/profile/listings/${listing.id}`} aria-label={`Se ${listing.title}`}>
              {listing.imageUrls?.[0] ? <img className={styles.productImage} src={listing.imageUrls[0]} alt={listing.title} /> : <span className={styles.imagePlaceholder}>Intet billede</span>}
              <span className={styles.price}>{Number(listing.price).toFixed(2).replace(".", ",")} kr.</span>
              <span className={styles.metric}>Visninger —</span>
              <span className={styles.metric}>Favoritter —</span>
            </Link>
            <button className={styles.boostButton} type="button" onClick={() => setMessage("Boost bliver snart tilgængeligt.")}>Boost</button>
          </article>
        ))}
      </div>
    </section>
  );
}
