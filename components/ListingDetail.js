"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteListing, updateListingStatus } from "@/app/actions/listings";
import styles from "@/app/profile/listings/detail.module.css";

const statusLabels = { active: "Aktiv", reserved: "Reserveret", sold: "Solgt", hidden: "Skjult" };

export default function ListingDetail({ listing }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const image = listing.imageUrls?.[0];

  async function setStatus(status) {
    setBusy(true);
    const result = await updateListingStatus(listing.id, status);
    setBusy(false);
    setMenuOpen(false);
    if (result?.ok) router.refresh();
    else setMessage(result?.message || "Status kunne ikke ændres.");
  }

  async function removeListing() {
    setBusy(true);
    const result = await deleteListing(listing.id);
    setBusy(false);
    if (result?.ok) router.push("/profile/listings?deleted=1");
    else { setConfirmDelete(false); setMessage(result?.message || "Annoncen kunne ikke slettes."); }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        {image ? <img src={image} alt={listing.title} /> : <div className={styles.noImage}>Intet billede</div>}
        <Link className={styles.back} href="/profile/listings" aria-label="Tilbage"><img src="/arrow-icon.svg" alt="" /></Link>
        <button className={styles.more} type="button" onClick={() => setMenuOpen(true)} aria-label="Annonceindstillinger">•••</button>
        {listing.imageUrls?.length > 1 && <span className={styles.imageCount}>1 / {listing.imageUrls.length}</span>}
      </section>
      <section className={styles.summary}>
        <h1>{listing.title}</h1>
        <p className={styles.price}>{Number(listing.price).toFixed(2).replace(".", ",")} kr.</p>
        <p className={styles.subtotal}>{(Number(listing.price) * 1.15).toFixed(2).replace(".", ",")} kr. inkl. køberbeskyttelse (subtotal for køber)</p>
        <button type="button" className={styles.boost} onClick={() => setMessage("Boost bliver snart tilgængeligt.")}>Boost</button>
        <button type="button" className={styles.share} onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}>↥　Del</button>
      </section>
      <div className={styles.separator} />
      <section className={styles.description}><h2>Beskrivelse</h2><p>{listing.description}</p><dl><div><dt>Kategori</dt><dd>{listing.category || "—"}</dd></div>{listing.brand && <div><dt>Varemærke</dt><dd>{listing.brand}</dd></div>}{listing.size && <div><dt>Størrelse</dt><dd>{listing.size}</dd></div>}{listing.condition && <div><dt>Artiklens stand</dt><dd>{listing.condition}</dd></div>}</dl></section>
      {message && <p className={styles.message} role="status">{message}</p>}
      {menuOpen && <div className={styles.scrim} onClick={() => setMenuOpen(false)}>
        <div className={styles.actionSheet} role="dialog" aria-modal="true" aria-label="Annonceindstillinger" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => setStatus("sold")} disabled={busy}>Marker som solgt</button>
          <button type="button" onClick={() => setStatus("reserved")} disabled={busy}>Marker som reserveret</button>
          <button type="button" onClick={() => setStatus(listing.status === "hidden" ? "active" : "hidden")} disabled={busy}>{listing.status === "hidden" ? "Vis annonce" : "Skjul"}</button>
          <Link href={`/profile/listings/${listing.id}/edit`}>Rediger</Link>
          <button className={styles.danger} type="button" onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}>Slet</button>
          <button className={styles.cancel} type="button" onClick={() => setMenuOpen(false)}>Luk</button>
        </div>
      </div>}
      {confirmDelete && <div className={styles.scrim}>
        <section className={styles.confirm} role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
          <h2 id="delete-title">Slet annonce?</h2><p>Er du sikker på, at du vil slette denne annonce? Den kan ikke gendannes.</p>
          <button className={styles.danger} type="button" disabled={busy} onClick={removeListing}>{busy ? "Sletter…" : "Slet annonce"}</button>
          <button type="button" onClick={() => setConfirmDelete(false)}>Annuller</button>
        </section>
      </div>}
      <span className={styles.status}>{statusLabels[listing.status] || listing.status}</span>
    </main>
  );
}
