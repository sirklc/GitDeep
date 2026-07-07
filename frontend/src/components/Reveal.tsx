"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type Direction = "up" | "left" | "right" | "none" | "flip";

const HIDDEN: Record<Direction, string> = {
  up: "translate-y-10 opacity-0",
  left: "-translate-x-10 opacity-0",
  right: "translate-x-10 opacity-0",
  none: "opacity-0",
  flip: "origin-top opacity-0 [transform:perspective(1400px)_rotateX(-78deg)]",
};

const SHOWN: Record<Direction, string> = {
  up: "translate-x-0 translate-y-0 opacity-100",
  left: "translate-x-0 translate-y-0 opacity-100",
  right: "translate-x-0 translate-y-0 opacity-100",
  none: "translate-x-0 translate-y-0 opacity-100",
  flip: "origin-top opacity-100 [transform:perspective(1400px)_rotateX(0deg)]",
};

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  style,
}: Readonly<{
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  style?: CSSProperties;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const show = visible || reducedMotion;

  return (
    <div
      ref={ref}
      style={{ ...style, transitionDelay: show ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${show ? SHOWN[direction] : HIDDEN[direction]} ${className}`}
    >
      {children}
    </div>
  );
}
