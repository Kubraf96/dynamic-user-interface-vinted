"use client";

import { useState } from "react";
import { deleteListing, updateListing } from "@/app/actions/listings";
import styles from "@/app/profile/listings/page.module.css";

export default function ManageListings({ initialListings }) {
  const [listings, setListings] = useState(initialListings);
  const [pendingId, setPendingId] = useState(null);
  const [message, setMessage] = useState("");

  async function handleDelete(id) {
    const confirmed = window.confirm("Er du sikker på, at du vil slette annoncen? Den kan ikke gendannes.");
    if (!confirmed || pendingId) return;

    const previousListings = listings;
    setMessage("");
    setPendingId(id);
    setListings((current) => current.filter((listing) => listing.id !== id));

    try {
      const result = await deleteListing(id);
      if (!result?.ok) {
        setListings(previousListings);
        setMessage(result?.message || "Annoncen kunne ikke slettes.");
      } else {
        setMessage("Annoncen er slettet.");
      }
    } catch {
      setListings(previousListings);
      setMessage("Der opstod en fejl under sletningen. Annoncen er gendannet i listen.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      {message && <p className={styles.message} role="status">{message}</p>}
      {!listings.length && <p>Du har ingen annoncer endnu.</p>}
      <div className={styles.list}>
        {listings.map((listing) => (
          <article className={styles.card} key={listing.id}>
            <form action={updateListing} className={styles.form}>
              <input type="hidden" name="id" value={listing.id} />
              <label htmlFor={`title-${listing.id}`}>Titel</label>
              <input id={`title-${listing.id}`} name="title" defaultValue={listing.title} maxLength={120} required />
              <label htmlFor={`description-${listing.id}`}>Beskrivelse</label>
              <textarea id={`description-${listing.id}`} name="description" defaultValue={listing.description} rows={3} maxLength={3000} required />
              <div className={styles.row}>
                <div><label htmlFor={`price-${listing.id}`}>Pris</label><input id={`price-${listing.id}`} name="price" type="number" min="0.01" step="0.01" defaultValue={listing.price} required /></div>
                <div><label htmlFor={`status-${listing.id}`}>Status</label><select id={`status-${listing.id}`} name="status" defaultValue={listing.status}><option value="active">Aktiv</option><option value="sold">Solgt</option></select></div>
              </div>
              <button type="submit">Gem ændringer</button>
            </form>
            <button
              className={styles.delete}
              type="button"
              disabled={pendingId !== null}
              onClick={() => handleDelete(listing.id)}
            >
              {pendingId === listing.id ? "Sletter…" : "Slet annonce"}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
