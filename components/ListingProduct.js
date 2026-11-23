"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import FavoriteButton from "./FavoriteButton.js";
import ListingFeed from "./ListingFeed.js";
import styles from "./ListingProduct.module.css";

export default function ListingProduct({ listing, seller, sellerListings, favoriteIds, favoriteCounts, currentUserId }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const touchStartX = useRef(null);
  const photos = listing.imageUrls || [];
  const price = Number(listing.price) || 0;
  const total = price * 1.05 + 5;
  const username = seller?.username || seller?.full_name || "Vinted-medlem";

  function handleTouchEnd(event) {
    if (touchStartX.current === null || photos.length < 2) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    setPhotoIndex((index) => Math.max(0, Math.min(photos.length - 1, index + (deltaX < 0 ? 1 : -1))));
  }

  return <main className={styles.page}>
    <section
      className={styles.gallery}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStartX.current = null; }}
    >
      {photos[photoIndex] ? <img className={styles.photo} src={photos[photoIndex]} alt={listing.title} /> : <div className={styles.noPhoto}>Intet billede</div>}
      <Link href="/" className={styles.back} aria-label="Tilbage"><img src="/arrow-icon.svg" alt="" /></Link>
      {currentUserId !== listing.seller_id && <FavoriteButton listingId={listing.id} initialFavorite={favoriteIds.includes(listing.id)} initialCount={favoriteCounts[listing.id] || 0} />}
      {photos.length > 1 && <div className={styles.dots}>{photos.map((_, index) => <button key={index} type="button" aria-label={`Vis billede ${index + 1}`} className={photoIndex === index ? styles.activeDot : ""} onClick={() => setPhotoIndex(index)} />)}</div>}
    </section>
    <section className={styles.summary}>
      <h1>{listing.title}</h1>
      <p className={styles.meta}>{[listing.size, listing.condition, listing.brand].filter(Boolean).join(" · ")}</p>
      <p className={styles.price}>{price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.</p>
      <p className={styles.total}>{total.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. inkl. køberbeskyttelse <img src="/home/shield-check.svg" alt="" /></p>
    </section>
    <div className={styles.separator} />
    <section className={styles.description}><h2>Beskrivelse</h2><p>{listing.description}</p></section>
    <div className={styles.separator} />
    <section className={styles.seller}><span className={styles.avatar}>{username.slice(0, 1).toUpperCase()}</span><div><strong>@{username}</strong><small>Sælger</small></div><Link href="/inbox">Spørg sælgeren</Link></section>
    {sellerListings.length > 0 && <>
      <div className={styles.separator} />
      <section className={styles.bundles}>
        <header><div><h2>Køb bundles</h2><p>Op til 10% rabat</p></div><button type="button" onClick={() => setNotice(`Her kan du samle flere annoncer fra @${username}.`)}>Lav et bundle</button></header>
        <ListingFeed listings={sellerListings} favoriteIds={favoriteIds} favoriteCounts={favoriteCounts} currentUserId={currentUserId} />
      </section>
    </>}
    <section className={styles.shipping}><h2>Porto</h2><span>Fra 24,60 kr.</span><p>Køber betaler forsendelsen.</p></section>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <footer className={styles.purchase}>
      <div><button type="button" onClick={() => setNotice("Tilbud bliver snart tilgængelige.")}>Giv et tilbud</button><button type="button" onClick={() => setNotice("Køb bliver snart tilgængeligt.")}>Køb nu</button></div>
      <a href="#sikkerhed">Vinted beskytter hvert eneste køb</a>
    </footer>
    <section id="sikkerhed" className={styles.safety}><h2>Køb og sælg sikkert</h2><p>Køberbeskyttelse følger med ved køb.</p></section>
  </main>;
}
