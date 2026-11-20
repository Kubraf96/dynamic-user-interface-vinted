"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Illustration from "./Illustration";
import { slides } from "./slides";
import styles from "./Story.module.css";

function SlideText({ id }) {
  switch (id) {
    case "rolle":
      return (
        <>
          <div className={`${styles.title} ${styles.display}`} style={{ top: 84 }}>
            <p className={styles.small}>Din rolle i 2026 var</p>
            <p className={styles.large}>“The Leather Lover”</p>
          </div>
          <p className={`${styles.bottomText} ${styles.display}`} style={{ top: 467 }}>
            Du har købt 13 artikler i materialet læder!
          </p>
        </>
      );
    case "koeb-i-alt":
      return (
        <>
          <div className={`${styles.relove} ${styles.cooper}`} aria-label="Relove, resell, repeat">
            <span aria-hidden="true">Relove</span>
            <span aria-hidden="true">Resell</span>
            <span aria-hidden="true" className={styles.repeat}>Repeat</span>
            <span aria-hidden="true">Relove</span>
            <span aria-hidden="true">Resell</span>
          </div>
          <p className={`${styles.bottomText} ${styles.display}`} style={{ top: 466, width: 289 }}>
            Du gjorde 53 køb i 2026, men hvor startede det?
          </p>
        </>
      );
    case "foerste-koeb":
      return (
        <div className={`${styles.firstFind} ${styles.cooper}`}>
          <p className={styles.large}>Dit første fund!</p>
          <p className={styles.firstFindText}>Du har gjort dit første køb og givet en brugt ting nyt liv.</p>
        </div>
      );
    case "solgt-kategori":
      return (
        <>
          <div className={`${styles.title} ${styles.cooper} ${styles.onDark}`} style={{ top: 84 }}>
            <p className={styles.small}>Du solgte</p>
            <p className={styles.large}>7 par sko</p>
          </div>
          <p className={`${styles.bottomText} ${styles.cooper} ${styles.onDark}`} style={{ top: 493 }}>
            Og tjente 2.761 kr. kun på at sælge sko!
          </p>
        </>
      );
    case "solgt-i-alt":
      return (
        <div className={`${styles.title} ${styles.cooper}`} style={{ top: 75, width: 301 }}>
          <p className={styles.huge}>2026</p>
          <p className={styles.small} style={{ width: 289 }}>Du solgte i alt for 6.344 kr.</p>
        </div>
      );
    case "slut":
      return (
        <>
          <p className={`${styles.title} ${styles.cooper} ${styles.small}`} style={{ top: 76, width: 314 }}>
            Tak for at se med
          </p>
          <p className={`${styles.warrior} ${styles.cooper}`}>
            <span>Du er en ægte</span>
            <img src="/year/vinted-wordmark.svg" alt="Vinted" width="156" height="50.3562" />
            <span>kriger</span>
          </p>
        </>
      );
    default:
      return null;
  }
}

export default function Story() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  function goBack() {
    if (index === 0) router.push("/profile/year");
    else setIndex(index - 1);
  }

  function goNext() {
    if (isLast) router.push("/profile/year");
    else setIndex(index + 1);
  }

  // Keep the browser chrome colour in sync with the slide background
  useEffect(() => {
    document.body.style.background = slide.page;
    return () => {
      document.body.style.background = "";
    };
  }, [slide.page]);

  return (
    <main className={styles.story} style={{ background: slide.page }}>
      <div className={styles.frame}>
        <div className={styles.topBar}>
          <button type="button" className={styles.back} onClick={goBack} aria-label="Gå tilbage">
            <img src={slide.arrow} alt="" width="40.5" height="40" />
          </button>
        </div>

        <section
          key={slide.id}
          className={styles.card}
          style={{ background: slide.card }}
          aria-roledescription="slide"
          aria-label={`${index + 1} af ${slides.length}`}
        >
          {slide.cardImage && (
            <div className={styles.cardImage} aria-hidden="true">
              <img src={slide.cardImage} alt="" />
            </div>
          )}

          <img className={styles.logo} src="/year/vinted-logo.png" alt="Vinted" width="81.92" height="47.36" />

          {slide.layers.map((layer) => (
            <Illustration key={layer.src} {...layer} />
          ))}

          <SlideText id={slide.id} />

          <button
            type="button"
            className={`${styles.cta} ${slide.button.theme === "light" ? styles.ctaLight : ""}`}
            onClick={goNext}
          >
            {slide.button.label}
          </button>
        </section>
      </div>
    </main>
  );
}
