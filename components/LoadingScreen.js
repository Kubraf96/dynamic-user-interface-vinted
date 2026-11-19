"use client";

import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";
import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  const [animationData, setAnimationData] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/animations/logo-animation.json")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the loading animation.");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setVisible(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (animationData) return;

    const timeout = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [animationData]);

  if (!visible) return null;

  return (
    <div className={styles.loadingScreen} role="status" aria-label="Indlæser app">
      {animationData && (
        <Lottie
          className={styles.animation}
          src={animationData}
          loop={false}
          autoplay
          subscriptions={{
            complete: () => setVisible(false),
            error: () => setVisible(false),
          }}
        />
      )}
    </div>
  );
}
