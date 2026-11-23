"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const categories = ["Kvinder", "Mænd", "Børn", "Bolig", "Elektronik", "Bøger og medier", "Hobby og samleobjekter", "Sport"];
const conditions = ["Ny med prismærke", "Meget god", "God", "Acceptabel"];

export default function SellPage() {
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const imagesRef = useRef([]);
  const [images, setImages] = useState([]);
  imagesRef.current = images;
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => () => imagesRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview)), []);

  function onImageChange(event) {
    const files = Array.from(event.target.files || []);
    setError("");
    if (files.length > 5 - images.length) setError("Du kan højst vælge 5 billeder.");
    setImages((current) => {
      const additions = files.slice(0, Math.max(0, 5 - current.length)).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...current, ...additions];
    });
    event.target.value = "";
  }

  function removeImage(index) {
    setImages((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (images.length === 0) {
      setError("Vælg mindst ét billede til annoncen.");
      return;
    }
    setPending(true);
    try {
      const formData = new FormData(formRef.current);
      images.forEach(({ file }) => formData.append("images", file));
      const response = await fetch("/api/listings", { method: "POST", body: formData });
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
        <div className={`${styles.imageGrid} ${images.length ? "" : styles.imageGridEmpty}`}>
          {images.map(({ preview }, index) => <div className={styles.imageTile} key={preview}>
            <img src={preview} alt={`Forhåndsvisning af produktbillede ${index + 1}`} />
            {index === 0 && <span className={styles.primaryBadge}>Primær</span>}
            <button className={styles.removeImage} type="button" onClick={() => removeImage(index)} aria-label={`Slet billede ${index + 1}`}>×</button>
          </div>)}
          {images.length < 5 && <button className={`${styles.upload} ${images.length ? styles.uploadMore : ""}`} type="button" onClick={() => fileInputRef.current?.click()} aria-label="Tilføj et billede">
            {images.length ? <svg className={styles.cameraIcon} viewBox="0 0 64 64" aria-hidden="true">
              <path d="M8 19h10l5-7h18l5 7h10a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V23a4 4 0 0 1 4-4Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
              <circle cx="32" cy="36" r="11" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg> : <span><b>＋</b> Upload fotos</span>}
          </button>}
        </div>
        <input ref={fileInputRef} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif" multiple onChange={onImageChange} />
        <small>Op til 5 billeder · JPG, PNG, WebP, AVIF eller HEIC · højst 10 MB pr. billede</small>
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
