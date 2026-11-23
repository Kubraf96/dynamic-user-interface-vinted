"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";
import styles from "./FavoriteButton.module.css";

export default function FavoriteButton({ listingId, initialFavorite = false, initialCount = 0 }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [count, setCount] = useState(Number(initialCount) || 0);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (pending) return;
    const before = favorite;
    setFavorite(!before);
    setCount((value) => Math.max(0, value + (before ? -1 : 1)));
    setError("");
    startTransition(async () => {
      const result = await toggleFavorite(listingId);
      if (result?.loginRequired) {
        setFavorite(before);
        setCount((value) => Math.max(0, value + (before ? 1 : -1)));
        router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      } else if (!result?.ok) {
        setFavorite(before);
        setCount((value) => Math.max(0, value + (before ? 1 : -1)));
        setError(result?.message || "Favoritten kunne ikke gemmes.");
      } else if (result.count !== null) setCount(Number(result.count));
    });
  }

  return <span className={styles.wrap}>
    <button className={`${styles.button} ${favorite ? styles.active : ""}`} type="button" aria-label={favorite ? "Fjern fra favoritter" : "Gem i favoritter"} aria-pressed={favorite} disabled={pending} onClick={handleClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 4.1-6.2 9-8.2 10.5a1 1 0 0 1-1.2 0C9.4 17.8 3.2 12.9 3.2 8.8a4.4 4.4 0 0 1 8.1-2.4l.7 1 .7-1a4.4 4.4 0 0 1 8.1 2.4Z" /></svg>
      <span>{count}</span>
    </button>
    {error && <span role="alert" className={styles.error}>{error}</span>}
  </span>;
}
