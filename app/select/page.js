"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BoothShell from "../components/BoothShell";
import styles from "../booth.module.css";
import { AGE_GROUPS, GENDERS, readBooth, writeBooth } from "../../lib/booth";

export default function SelectPage() {
  const router = useRouter();
  const [gender, setGender] = useState(null);
  const [ageGroup, setAgeGroup] = useState(null);

  useEffect(() => {
    const booth = readBooth();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
    if (booth.gender) setGender(booth.gender);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
    if (booth.ageGroup) setAgeGroup(booth.ageGroup);
  }, []);

  function pickGender(id) {
    setGender(id);
    writeBooth({ gender: id });
  }

  function pickAge(id) {
    setAgeGroup(id);
    writeBooth({ ageGroup: id });
  }

  function proceed() {
    if (!gender || !ageGroup) return;
    router.push("/crew");
  }

  return (
    <BoothShell bgColor="#050816" showHome>
      <img className={styles.bgPhoto} style={{ opacity: 0.5 }} src="/figma/genderage-bg.png" alt="" />
      <div className={styles.darkContent}>
        <h1 className={styles.darkHeading}>
          Tell Us About
          <br />
          <span className={styles.darkHeadingGradient}>Yourself</span>
        </h1>
        <p className={styles.darkCopy}>
          We&rsquo;ll create the most realistic movie crew transformation
          tailored to you.
        </p>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLabel}>Select Gender</span>
        </div>
        <div className={`${styles.darkCardGrid} ${styles.gender}`}>
          {GENDERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.darkCard} ${gender === option.id ? styles.darkCardActive : ""}`}
              onClick={() => pickGender(option.id)}
            >
              <img src={option.icon} alt="" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLabel}>Select Age Group</span>
        </div>
        <div className={`${styles.darkCardGrid} ${styles.age}`}>
          {AGE_GROUPS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.darkCard} ${ageGroup === option.id ? styles.darkCardActive : ""}`}
              onClick={() => pickAge(option.id)}
            >
              <img src={option.icon} alt="" />
              <span>
                {option.label}
                <small>{option.range}</small>
              </span>
            </button>
          ))}
        </div>

        <button
          className={styles.gradientCta}
          type="button"
          disabled={!gender || !ageGroup}
          onClick={proceed}
          style={{ marginTop: "22px" }}
        >
          Continue
          <img className={styles.buttonIcon} src="/figma/icon-arrow-right.svg" alt="" />
        </button>
      </div>
    </BoothShell>
  );
}
