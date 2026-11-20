"use client";

import { useEffect, useState } from "react";
import { formatKr } from "@/lib/economy";
import styles from "./BarChart.module.css";

const MAX_BAR_HEIGHT = 127;

// Paired sold/bought bars. Bars grow from 1px on mount ("Start" → "Afspillet" in Figma).
export default function BarChart({ items, selectedSlug, onSelect, variant = "month", onPlayed }) {
  const [played, setPlayed] = useState(false);
  const max = Math.max(...items.flatMap((item) => [item.sold, item.bought]), 1);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPlayed(true);
      onPlayed?.();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [onPlayed]);

  const heightFor = (value) => (played ? Math.max(1, Math.round((value / max) * MAX_BAR_HEIGHT)) : 1);

  return (
    <div className={`${styles.chart} ${variant === "year" ? styles.year : ""}`}>
      <div className={styles.grid} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className={styles.pairs}>
        {items.map((item) => {
          const selected = item.slug === selectedSlug;

          return (
            <button
              type="button"
              key={item.slug}
              className={`${styles.pair} ${selected ? styles.selected : ""}`}
              aria-pressed={selected}
              aria-label={`${item.label}: solgt ${formatKr(item.sold)}, købt ${formatKr(item.bought)}`}
              onClick={() => onSelect(item.slug)}
            >
              <span className={styles.bars}>
                <span className={styles.sold} style={{ height: heightFor(item.sold) }} />
                <span className={styles.bought} style={{ height: heightFor(item.bought) }} />
              </span>
              <span className={styles.label}>{item.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
