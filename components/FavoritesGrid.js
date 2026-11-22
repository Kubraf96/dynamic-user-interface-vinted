"use client";

import { useState } from "react";
import ListingFeed from "@/components/ListingFeed";
import styles from "@/app/profile/favorites/page.module.css";

export default function FavoritesGrid({ initialListings, favoriteCounts, currentUserId }) {
  const [listings, setListings] = useState(initialListings);

  function handleFavoriteChange(id, isFavorite) {
    if (!isFavorite) setListings((current) => current.filter((listing) => listing.id !== id));
  }

  return listings.length
    ? <ListingFeed listings={listings} favoriteIds={listings.map(({ id }) => id)} favoriteCounts={favoriteCounts} showCategories={false} onFavoriteChange={handleFavoriteChange} currentUserId={currentUserId} />
    : <section className={styles.empty}><h2>Ingen favoritartikler endnu</h2><p>Tryk på hjertet på en annonce for at gemme den her.</p></section>;
}
