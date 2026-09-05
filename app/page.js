"use client";

import { useRouter } from "next/navigation";
import BoothShell from "./components/BoothShell";
import styles from "./booth.module.css";
import { clearBooth } from "../lib/booth";

export default function Home() {
  const router = useRouter();

  function start() {
    clearBooth();
    router.push("/select");
  }

  return (
    <BoothShell background="/figma/home-bg.png" bgOpacity={1} bgColor="#050816" showHome={false}>
      <div className={`${styles.darkContent} ${styles.darkContentBottom}`}>
        <span className={styles.homeKickerDark}>Behind The Camera</span>
        <h1 className={`${styles.darkHeading} ${styles.darkHeadingLg}`}>
          See Yourself
          <br />
          Behind The
          <br />
          Scenes
        </h1>
        <p className={styles.darkCopy}>
          Discover the people behind the scenes—from directing the action to
          capturing every cinematic frame.
        </p>
        <button className={styles.gradientCta} type="button" onClick={start}>
          Start Experience
          <img className={styles.buttonIcon} src="/figma/icon-arrow-right.svg" alt="" />
        </button>
        <p className={styles.homeTagline}>
          Light, Camera, <em>AI Magic</em>
        </p>
      </div>
    </BoothShell>
  );
}
