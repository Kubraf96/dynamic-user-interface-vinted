"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
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
