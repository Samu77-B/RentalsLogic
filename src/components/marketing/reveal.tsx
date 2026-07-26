"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms once visible */
  delay?: number;
  /** Slight horizontal drift instead of only rising */
  from?: "up" | "left" | "right";
};

export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden =
    from === "left"
      ? "-translate-x-5 opacity-0"
      : from === "right"
        ? "translate-x-5 opacity-0"
        : "translate-y-6 opacity-0";

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        visible ? "translate-x-0 translate-y-0 opacity-100" : hidden,
        className
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" } as CSSProperties}
    >
      {children}
    </div>
  );
}
