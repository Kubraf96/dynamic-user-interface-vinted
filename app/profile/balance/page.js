"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

const transactions = [
  { id: "jeans", type: "Købt", title: "Jeans", amount: "-76,85 kr.", date: "13. nov. 2026", positive: false },
  { id: "brune-stovler", type: "Solgt", title: "Brune støvler", amount: "269,10 kr.", date: "9. nov. 2026", positive: true },
];

export default function BalancePage() {
  const [modal, setModal] = useState(null);
  const [amount, setAmount] = useState("");

  return (
    <main className={styles.page}>
      <div className={styles.pending}>
        <span>Afventende saldo</span>
        <span className={styles.pendingAmount}>
          0,00 kr.
          <img src="/economy/information.svg" alt="" width="23.488" height="23.488" />
        </span>
      </div>

      <section className={styles.summary}>
        <div className={styles.available}>
          <strong>116,15 kr.</strong>
          <span>Tilgængelig saldo</span>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={() => setModal("withdraw")}>
            <span className={styles.actionIcon}>
              <img src="/economy/withdraw-bank.svg" alt="" width="27.1017" height="27.1017" />
            </span>
            Udbetal
          </button>
          <Link href="/" className={styles.action}>
            <span className={styles.actionIcon}>
              <img src="/economy/shopping-cart.svg" alt="" width="28.909" height="28.909" />
            </span>
            Køb
          </Link>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      <Link href="/profile/balance/overview" className={styles.overviewLink}>
        Mit overblik
        <img src="/economy/chevron-right.svg" alt="" width="20" height="20" />
      </Link>

      <div className={styles.sectionDivider} />

      <p className={styles.monthLabel}>november 2026</p>

      <ul className={styles.transactions}>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            <Link href="/profile/orders" className={styles.transaction}>
              <span className={styles.transactionType}>{transaction.type}</span>
              <span className={styles.transactionRow}>
                <span>{transaction.title}</span>
                <span className={styles.transactionTrailing}>
                  <span className={transaction.positive ? styles.positive : styles.negative}>
                    {transaction.amount}
                  </span>
                  <img src="/economy/chevron-right.svg" alt="" width="20" height="20" />
                </span>
              </span>
              <span className={styles.transactionDate}>{transaction.date}</span>
            </Link>
          </li>
        ))}
        <li className={styles.transaction}>
          <span className={styles.transactionRow}>
            <span className={styles.transactionType}>Startsaldo 01.11.2026</span>
            <span className={styles.transactionTrailing}>
              <span className={styles.positive}>317,10 kr.</span>
              <img src="/economy/chevron-right.svg" alt="" width="20" height="20" />
            </span>
          </span>
        </li>
      </ul>

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
            <h2 id="balance-modal-title">Udbetal saldo</h2>
            <label>
              Beløb i danske kroner
              <input
                type="number"
                min="1"
                max="116.15"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00 kr."
              />
            </label>
            <button type="button" className={styles.submit} disabled={!amount}>
              Udbetal til bank
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
