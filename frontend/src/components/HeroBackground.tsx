"use client";

import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

export default function HeroBackground({ videoSrc }: Readonly<{ videoSrc?: string }>) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      {videoSrc && !reducedMotion && (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Sabit gradyan katmanı: video yüklenmeden önce/başarısız olursa da marka hissini korur. */}
      <div
        className="motion-safe:animate-[float_10s_ease-in-out_infinite] absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="motion-safe:animate-[float_12s_ease-in-out_infinite_reverse] absolute -right-24 top-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
    </div>
  );
}
