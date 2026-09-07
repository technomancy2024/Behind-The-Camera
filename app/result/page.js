"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BoothShell from "../components/BoothShell";
import styles from "../booth.module.css";
import { CREW_ROLES, clearBooth, readBooth, writeBooth } from "../../lib/booth";

export default function ResultPage() {
  const router = useRouter();
  const [resultUrl, setResultUrl] = useState(null);
  const [role, setRole] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const booth = readBooth();
    if (!booth.resultUrl) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
    setResultUrl(booth.resultUrl);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
    setRole(booth.role);
    setReady(true);
  }, [router]);

  function download() {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl.startsWith("data:") || resultUrl.startsWith("blob:")
      ? resultUrl
      : `/api/download?url=${encodeURIComponent(resultUrl)}`;
    link.download = "behind-the-camera.webp";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function retake() {
    writeBooth({ capturedImage: null, resultUrl: null });
    router.push("/capture");
  }

  function goHome() {
    clearBooth();
    router.push("/");
  }

  if (!ready) return null;

  const roleLabel = CREW_ROLES.find((option) => option.id === role)?.label || "Film Crew";

  return (
    <BoothShell background="/figma/result-bg.png" bgOpacity={0.7} bgColor="#050816">
      <div className={styles.darkContent}>
        <h1 className={styles.darkHeading}>
          Download
          <br />
          <span className={styles.darkHeadingGradientReverse}>Your Moment</span>
        </h1>
        <p className={styles.darkCopy}>
          Your AI cinematic transformation is complete. Experience yourself as
          one of the talented professionals who bring every story to life.
        </p>

        <div className={styles.resultCardWrap}>
          <div className={styles.roleBadge}>
            <img src="/figma/icon-star.svg" alt="" />
            {roleLabel}
            <img src="/figma/icon-star.svg" alt="" />
          </div>
          <div className={styles.resultCard}>
            <img src={resultUrl} alt="Your generated festival caricature" />
          </div>
        </div>

        <button className={styles.gradientCta} type="button" onClick={download}>
          <img className={styles.buttonIcon} src="/figma/icon-download.svg" alt="" />
          Download
        </button>

        <div className={styles.resultButtons}>
          <button type="button" className={styles.outlineDark} onClick={retake}>
            <img className={styles.buttonIcon} src="/figma/icon-retake-outline.svg" alt="" />
            Retake
          </button>
          <button type="button" className={styles.gradientCta} onClick={goHome}>
            <img className={styles.buttonIcon} src="/figma/icon-home-outline.svg" alt="" />
            Home
          </button>
        </div>
      </div>

    </BoothShell>
  );
}
