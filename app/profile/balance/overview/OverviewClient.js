"use client";

import { useCallback, useState } from "react";
import BarChart from "@/components/economy/BarChart";
import PeriodSummary from "@/components/economy/PeriodSummary";
import { formatKr, months, years, yearSummary } from "@/lib/economy";
import styles from "./page.module.css";

export default function OverviewClient({ initialMonth }) {
  const [mode, setMode] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(String(yearSummary.year));
  const [played, setPlayed] = useState(false);
  const handlePlayed = useCallback(() => setPlayed(true), []);

  const isMonth = mode === "month";
  const items = isMonth ? months : years;
  const selectedSlug = isMonth ? selectedMonth : selectedYear;
  const selected = items.find((item) => item.slug === selectedSlug) ?? items[0];

  function switchMode(nextMode) {
    if (nextMode === mode) return;
    setPlayed(false);
    setMode(nextMode);
  }

  return (
    <main className={styles.page}>
      <div className={styles.toggle} role="tablist" aria-label="Vis overblik pr.">
        {[
          { id: "month", label: "Måned" },
          { id: "year", label: "År" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            className={`${styles.tab} ${mode === tab.id ? styles.tabActive : ""}`}
            onClick={() => switchMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className={styles.totals} aria-label={`Total for ${yearSummary.year}`}>
        <h2>{yearSummary.year}</h2>
        <dl>
          <div>
            <dt>Solgt for</dt>
            <dd className={styles.sold}>{formatKr(yearSummary.sold)}</dd>
          </div>
          <div>
            <dt>Købt for</dt>
            <dd className={styles.bought}>{formatKr(yearSummary.bought)}</dd>
          </div>
        </dl>
      </section>

      <div className={styles.divider} />

      <div className={styles.legend} aria-hidden="true">
        <span>
          <img src="/economy/dot-sold.svg" alt="" width="16" height="16" />
          Solgt
        </span>
        <span>
          <img src="/economy/dot-bought.svg" alt="" width="16" height="16" />
          Købt
        </span>
      </div>

      <div className={styles.chartArea}>
        {/* key remounts the chart so the bars grow again when switching tab */}
        <BarChart
          key={mode}
          items={items}
          variant={mode}
          selectedSlug={selected.slug}
          onSelect={isMonth ? setSelectedMonth : setSelectedYear}
          onPlayed={handlePlayed}
        />

        <PeriodSummary
          label={selected.label}
          sold={selected.sold}
          bought={selected.bought}
          soldHref={isMonth ? `/profile/balance/${selected.slug}/solgt` : undefined}
          boughtHref={isMonth ? `/profile/balance/${selected.slug}/kobt` : undefined}
          dimmed={!played}
        />
      </div>
    </main>
  );
}
