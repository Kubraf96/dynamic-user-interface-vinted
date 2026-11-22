"use client";

import { useRef, useState, useTransition } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { createListing } from "@/app/actions/listings";
import styles from "./page.module.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const FORMATS = {
  jpg: { extension: "jpg", contentType: "image/jpeg" },
  jpeg: { extension: "jpg", contentType: "image/jpeg" },
  png: { extension: "png", contentType: "image/png" },
  webp: { extension: "webp", contentType: "image/webp" },
  avif: { extension: "avif", contentType: "image/avif" },
};

function getFormat(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return FORMATS[extension] || Object.values(FORMATS).find((format) => format.contentType === file.type);
}

export default function ListingForm() {
  const [stage, setStage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [isPending, startTransition] = useTransition();
  const submissionLocked = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionLocked.current) return;
    setUploadError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll("image").filter((file) => file instanceof File && file.size > 0);
    const formats = files.map(getFormat);

    if (!files.length || files.length > 5 || files.some((file, index) => !formats[index] || file.size > MAX_IMAGE_SIZE)) {
      setUploadError("Vælg 1-5 JPG-, PNG-, WebP- eller AVIF-billeder på højst 5 MB hver.");
      return;
    }

    submissionLocked.current = true;
    setStage("uploading");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      );
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        submissionLocked.current = false;
        setStage("");
        setUploadError("Din session er udløbet. Log ind igen, og prøv på ny.");
        return;
      }

      const uploadResults = await Promise.all(files.map(async (file, index) => {
        const format = formats[index];
        const path = `${user.id}/${window.crypto.randomUUID()}.${format.extension}`;
        const { error } = await supabase.storage.from("listing-images").upload(path, file, {
          contentType: format.contentType,
          upsert: false,
        });
        return { path, error };
      }));
      const uploadedPaths = uploadResults.filter(({ error }) => !error).map(({ path }) => path);
      const failedUpload = uploadResults.find(({ error }) => error);
      if (failedUpload) {
        if (uploadedPaths.length) await supabase.storage.from("listing-images").remove(uploadedPaths);
        submissionLocked.current = false;
        setStage("");
        setUploadError(`Billedet kunne ikke uploades: ${failedUpload.error.message}`);
        return;
      }

      formData.delete("image");
      formData.set("imagePaths", JSON.stringify(uploadedPaths));
      setStage("saving");
      startTransition(async () => {
        await createListing(formData);
      });
    } catch (error) {
      submissionLocked.current = false;
      setStage("");
      setUploadError(`Uploaden fejlede: ${error.message || "Ukendt fejl"}`);
    }
  }

  const busy = isPending || Boolean(stage);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <section className={styles.photoSection} aria-labelledby="photos-heading">
        <h2 id="photos-heading">Billeder</h2>
        <label className={styles.photoPicker} htmlFor="image">
          <span className={styles.photoButton}><span aria-hidden="true">＋</span> Upload fotos</span>
          <input id="image" name="image" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif" onChange={(event) => setPhotoName(Array.from(event.currentTarget.files || []).map((file) => file.name).join(", "))} required />
        </label>
        <small>JPG, PNG, WebP eller AVIF · op til 5 fotos, maks. 5 MB pr. foto</small>
        {photoName && <p className={styles.photoName}>{photoName}</p>}
      </section>

      <section className={styles.section}>
        <h2>Om din artikel</h2>
        <label htmlFor="title">Titel</label>
        <input id="title" name="title" maxLength={120} placeholder="Fortæl køberne, hvad du sælger" required />
        <label htmlFor="description">Beskrivelse</label>
        <textarea id="description" name="description" maxLength={3000} rows={5} placeholder="Fortæl køberne mere om det" required />
      </section>

      <section className={styles.section}>
        <h2>Oplysninger om artikel</h2>
        <details className={styles.accordion}>
          <summary><span>Kategori</span><span className={styles.plus} aria-hidden="true">＋</span></summary>
          <label className={styles.visuallyHidden} htmlFor="category">Kategori</label>
          <select id="category" name="category" defaultValue="" required>
            <option value="" disabled>Vælg kategori</option>
            <option>Kvinder</option><option>Mænd</option><option>Designerartikler</option><option>Børn</option>
            <option>Bolig</option><option>Elektronik</option><option>Bøger og medier</option><option>Hobby og samleobjekter</option><option>Sport</option>
          </select>
        </details>
        <div className={styles.optionalFields}>
          <label htmlFor="brand">Brand</label><input id="brand" name="brand" maxLength={100} />
          <label htmlFor="size">Størrelse</label><input id="size" name="size" maxLength={40} />
          <label htmlFor="condition">Stand</label>
          <select id="condition" name="condition" defaultValue=""><option value="">Vælg stand</option><option>Ny med mærke</option><option>Ny uden mærke</option><option>Meget god</option><option>God</option><option>Acceptabel</option></select>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Prissætning</h2>
        <details className={styles.accordion} open>
          <summary><span>Pris</span><span className={styles.plus} aria-hidden="true">＋</span></summary>
          <label className={styles.visuallyHidden} htmlFor="price">Pris i kroner</label>
          <div className={styles.priceField}><input id="price" name="price" type="number" min="0.01" step="0.01" placeholder="0,00" required /><span>kr.</span></div>
        </details>
      </section>

      {uploadError && <p className={styles.error} role="alert">{uploadError}</p>}
      {busy && <p className={styles.progress} role="status">{stage === "uploading" ? "Uploader billede…" : "Gemmer annoncen…"}</p>}
      <button className={styles.submit} type="submit" disabled={busy}>{busy ? "Uploader…" : "Upload"}</button>
    </form>
  );
}
