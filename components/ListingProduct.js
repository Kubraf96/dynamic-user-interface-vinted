"use client";

import Link from "next/link";
import { useState } from "react";
import ListingFeed from "@/components/ListingFeed";
import FavoriteButton from "@/components/FavoriteButton";
import styles from "./ListingProduct.module.css";

export default function ListingProduct({ listing, seller, sellerListings, favoriteIds, favoriteCounts, currentUserId }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const images = listing.imageUrls?.length ? listing.imageUrls : [];
  const price = Number(listing.price) || 0;
  const buyerTotal = price * 1.05 + 5;
  const sellerName = seller?.username || seller?.full_name || "Vinted-medlem";

  return (
    <main className={styles.page}>
      <section className={styles.gallery} aria-label="Produktbilleder">
        {images.length ? <img className={styles.photo} src={images[imageIndex]} alt={`${listing.title}, billede ${imageIndex + 1}`} /> : <div className={styles.noPhoto}>Intet billede</div>}
        <Link href="/" className={styles.back} aria-label="Tilbage til forsiden"><img src="/arrow-icon.svg" alt="" /></Link>
        <button className={styles.more} type="button" aria-label="Del annonce" onClick={async () => { try { await navigator.share?.({ title: listing.title, url: window.location.href }); } catch {} }}>•••</button>
        {currentUserId !== listing.seller_id && <FavoriteButton listingId={listing.id} initialFavorite={favoriteIds.includes(listing.id)} initialCount={favoriteCounts[listing.id] || 0} />}
        {images.length > 1 && <div className={styles.dots} aria-label={`${imageIndex + 1} af ${images.length}`}>
          {images.map((_, index) => <button key={index} type="button" aria-label={`Vis billede ${index + 1}`} aria-current={index === imageIndex ? "true" : undefined} className={index === imageIndex ? styles.activeDot : ""} onClick={() => setImageIndex(index)} />)}
        </div>}
      </section>

      <section className={styles.summary}>
        <h1>{listing.title}</h1>
        <p className={styles.itemMeta}>{[listing.size, listing.condition, listing.brand].filter(Boolean).join(" · ")}</p>
        <p className={styles.price}>{price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.</p>
        <p className={styles.buyerPrice}>{buyerTotal.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. inkl. Vinted-gebyr <img src="/home/shield-check.svg" alt="" /></p>
      </section>

      <div className={styles.separator} />
      <section className={styles.description}><h2>Beskrivelse</h2><p>{listing.description}</p></section>
      <div className={styles.separator} />
      <section className={styles.seller}>
        {seller?.avatar_url ? <img src={seller.avatar_url} alt="" /> : <div className={styles.avatar} aria-hidden="true">{sellerName.slice(0, 1).toUpperCase()}</div>}
        <div className={styles.sellerInfo}><strong>{sellerName}</strong><span>Vinted-medlem</span></div>
        <Link href="/inbox" className={styles.askSeller}>Spørg sælgeren</Link>
      </section>

      {sellerListings.length > 0 && <>
        <div className={styles.separator} />
        <section className={styles.bundles}>
          <div className={styles.bundleHeading}><div><h2>Køb bundles</h2><p>Op til 10% rabat</p></div><button type="button" onClick={() => setNotice(`Vælg flere artikler fra ${sellerName} for at samle dem i et bundle.`)}>Lav et bundle</button></div>
          <ListingFeed listings={sellerListings} favoriteIds={favoriteIds} favoriteCounts={favoriteCounts} showCategories={false} currentUserId={currentUserId} />
        </section>
      </>}

      <section id="sikkerhed" className={styles.shipping}><h2>Porto</h2><span>Fra 24,60 kr.</span><p>Køber betaler forsendelsen.</p></section>
      <section className={styles.safety}><h2>Køb og sælg sikkert</h2><p>Køberbeskyttelse og sikre betalinger følger med, når du handler på Vinted.</p></section>
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      <footer className={styles.purchaseBar}>
        <div className={styles.purchaseButtons}><button type="button" onClick={() => setNotice("Tilbud bliver snart tilgængelige.")}>Giv et tilbud</button><button type="button" onClick={() => setNotice("Køb bliver snart tilgængeligt.")}>Køb nu</button></div>
        <a href="#sikkerhed">Vinted beskytter hvert eneste køb</a>
      </footer>
    </main>
  );
}
