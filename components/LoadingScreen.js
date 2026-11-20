"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const startedOnMount = useRef(false);

  useEffect(() => {
    if (!startedOnMount.current) {
      if (window.sessionStorage.getItem("loading-screen-shown") === "true") {
        return;
      }

      startedOnMount.current = true;
      window.sessionStorage.setItem("loading-screen-shown", "true");
      setVisible(true);
    }

    const timeout = window.setTimeout(() => setVisible(false), 1830);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.loadingScreen} role="status" aria-label="Indlæser app">
      <img className={styles.animation} src="/animations/loading-logo.gif" alt="" />
    </div>
  );
}
