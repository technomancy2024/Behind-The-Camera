"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BoothShell from "../components/BoothShell";
import styles from "../booth.module.css";
import { buildPrompt, readBooth, writeBooth } from "../../lib/booth";

export default function GeneratingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(6);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const startedRef = useRef(false);
  const timerRef = useRef(null);

  async function startGeneration() {
    const booth = readBooth();
    if (!booth.capturedImage) {
      router.replace("/capture");
      return;
    }

    setError(null);
    setGenerating(true);
    setProgress(6);

    const prompt = buildPrompt(booth);

    timerRef.current = setInterval(() => {
      setProgress((current) => (current < 90 ? current + Math.random() * 8 : current));
    }, 450);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: [booth.capturedImage], prompt, style: "Festival" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");

      clearInterval(timerRef.current);
      setProgress(100);
      writeBooth({ resultUrl: data.url });
      setGenerating(false);
      setTimeout(() => router.push("/result"), 350);
    } catch {
      clearInterval(timerRef.current);
      setGenerating(false);
      setError(
        "We couldn't process your photo. There may have been an issue with how it was captured — please retake it and try again."
      );
    }
  }

  useEffect(() => {
    const booth = readBooth();
    if (!booth.capturedImage) {
      router.replace("/capture");
      return;
    }
    if (booth.resultUrl) {
      router.replace("/result");
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    startGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.round(progress);
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <BoothShell background="/figma/loading-bg.png" bgOpacity={0.8} bgColor="#050816" showHome>
      <div className={styles.darkContent}>
        <h1 className={styles.darkHeading}>
          Creating Your
          <br />
          <span className={styles.darkHeadingGradientVertical}>Crew Role</span>
          <br />
          Transformation
        </h1>
        <p className={styles.darkCopy}>
          Our AI is building a realistic behind-the-scenes cinematic
          experience.
        </p>

        <div className={styles.ringWrap}>
          <svg className={styles.darkShutterRing} viewBox="0 0 190 190">
            <circle cx="95" cy="95" r={radius} fill="none" stroke="#12294f" strokeWidth="14" />
            <circle
              cx="95"
              cy="95"
              r={radius}
              fill="none"
              stroke="#ff7c00"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className={styles.ringPercent}>
            {pct}
            <span>%</span>
          </span>
        </div>

        <div className={styles.darkLabelRow}>
          <img src="/figma/loading-icon-face.svg" alt="" />
          {progress < 100 ? "Preparing, Behind The Scene...." : "Almost there"}
        </div>

        {error && (
          <div className={styles.darkErrorBox}>
            {error}
            <div className={styles.darkErrorActions}>
              <button
                className={styles.outlineDark}
                type="button"
                onClick={() => router.push("/capture")}
              >
                Retake
              </button>
              <button
                className={styles.gradientCta}
                type="button"
                disabled={generating}
                onClick={startGeneration}
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </BoothShell>
  );
}
