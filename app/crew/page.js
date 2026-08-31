"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BoothShell from "../components/BoothShell";
import styles from "../booth.module.css";
import { pickCrewOptions, readBooth, writeBooth } from "../../lib/booth";

export default function CrewPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const booth = readBooth();
    if (!booth.gender || !booth.ageGroup) {
      router.replace("/select");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
    if (booth.role) setRole(booth.role);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- randomized once per visit, client-only to avoid SSR mismatch
    setOptions(pickCrewOptions(4));
  }, [router]);

  function pickRole(id) {
    setRole(id);
    writeBooth({ role: id });
  }

  function proceed() {
    if (!role) return;
    router.push("/capture");
  }

  return (
    <BoothShell bgColor="#050816" showHome>
      <img className={styles.bgPhoto} style={{ opacity: 0.4 }} src="/figma/crew-bg.png" alt="" />
      <div className={styles.darkContent}>
        <h1 className={styles.darkHeading}>
          Choose Your
          <br />
          <span className={styles.darkHeadingGradient}>Film Crew Role</span>
        </h1>
        <p className={styles.darkCopy}>
          Select the behind-the-scenes role you&rsquo;d like to experience.
          Our AI will transform you into a movie production professional.
        </p>

        <div className={`${styles.darkCardGrid} ${styles.crew}`}>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.darkCard} ${styles.crewCard} ${role === option.id ? styles.darkCardActive : ""}`}
              onClick={() => pickRole(option.id)}
            >
              <img src={option.icon} alt="" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <button
          className={styles.gradientCta}
          type="button"
          disabled={!role}
          onClick={proceed}
          style={{ marginTop: "22px" }}
        >
          Select The Crew
          <img className={styles.buttonIcon} src="/figma/icon-arrow-right.svg" alt="" />
        </button>
      </div>
    </BoothShell>
  );
}
