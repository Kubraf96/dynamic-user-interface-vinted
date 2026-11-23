"use client";

import { useRef, useState } from "react";
import styles from "./page.module.css";

const categories = ["Kvinder", "Mænd", "Børn", "Bolig", "Elektronik", "Bøger og medier", "Hobby og samleobjekter", "Sport"];
const conditions = ["Ny med prismærke", "Meget god", "God", "Acceptabel"];

export default function SellPage() {
  const formRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function onImageChange(event) {
    const file = event.target.files?.[0];
    setError("");
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/listings", { method: "POST", body: new FormData(formRef.current) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Annoncen kunne ikke oprettes.");
      window.location.assign(`/listing/${result.id}`);
    } catch (cause) {
      setError(cause.message || "Noget gik galt. Prøv igen.");
      setPending(false);
    }
  }

  return <main className={styles.page}>
    <header className={styles.header}><a href="/" aria-label="Luk">×</a><h1>Sælg en artikel</h1><span /></header>
    <form ref={formRef} className={styles.form} onSubmit={onSubmit}>
      <section className={styles.section}>
        <h2>Billeder</h2>
        <label className={styles.upload}>
          {preview ? <img src={preview} alt="Forhåndsvisning af produkt" /> : <span><b>＋</b> Upload foto</span>}
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif" onChange={onImageChange} required />
        </label>
        <small>JPG, PNG, WebP eller AVIF · højst 5 MB</small>
      </section>
      <section className={styles.section}>
        <h2>Om din artikel</h2>
        <label>Titel<input name="title" placeholder="Fortæl køberne, hvad du sælger" maxLength={120} required /></label>
        <label>Beskrivelse<textarea name="description" placeholder="Fortæl køberne mere om det" rows={5} maxLength={3000} required /></label>
      </section>
      <section className={styles.section}>
        <h2>Oplysninger om artikel</h2>
        <label>Kategori<select name="category" required defaultValue=""><option value="" disabled>Vælg kategori</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Størrelse<input name="size" placeholder="Fx M eller 38" maxLength={40} /></label>
        <label>Stand<select name="condition" required defaultValue=""><option value="" disabled>Vælg stand</option>{conditions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Varemærke<input name="brand" placeholder="Fx H&M" maxLength={80} /></label>
        <label>Pris i kr.<input name="price" type="number" min="1" step="0.01" placeholder="0,00" required /></label>
      </section>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Opretter annonce…" : "Upload"}</button>
    </form>
  </main>;
}
