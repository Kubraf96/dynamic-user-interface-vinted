"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function BalancePage() {
  const [modal, setModal] = useState(null);
  const [amount, setAmount] = useState("");

  return (
    <main className={styles.page}>
      <section className={styles.summary}>
        <p>Din saldo</p>
        <strong>317,10 kr.</strong>
        <span>Tilgængelig til udbetaling</span>
      </section>

      <div className={styles.actions}>
        <button type="button" onClick={() => setModal("withdraw")}>Hæv saldo</button>
        <button type="button" onClick={() => setModal("add")}>Tilføj penge</button>
      </div>

      <section className={styles.history}>
        <h2>Seneste aktiviteter</h2>
        <div className={styles.transaction}>
          <span className={styles.transactionIcon} aria-hidden="true">↗</span>
          <div>
            <strong>Beløb modtaget</strong>
            <small>Fra Anna M.</small>
          </div>
          <strong className={styles.positive}>+250 kr.</strong>
        </div>
        <div className={styles.transaction}>
          <span className={styles.transactionIcon} aria-hidden="true">⇄</span>
          <div>
            <strong>Udbetaling</strong>
            <small>Til dansk bankkonto</small>
          </div>
          <strong>-150 kr.</strong>
        </div>
      </section>

      {modal && (
        <div className={styles.overlay} role="presentation" onMouseDown={() => setModal(null)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="balance-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              aria-label="Luk"
              onClick={() => setModal(null)}
            >
              ×
            </button>
            <h2 id="balance-modal-title">
              {modal === "withdraw" ? "Hæv penge" : "Tilføj penge"}
            </h2>
            <label>
              Beløb i danske kroner
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00 kr."
              />
            </label>
            <button type="button" className={styles.submit} disabled={!amount}>
              {modal === "withdraw" ? "Hæv til bank" : "Fortsæt"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
