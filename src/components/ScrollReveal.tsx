import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Composant d’apparition progressive optimisé avec l’API Intersection Observer.
 * Utilise une transition CSS sur `opacity` et `transform: translateY(20px)`
 * tout en respectant la directive `prefers-reduced-motion`.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = "",
  delayMs = 0,
  threshold = 0.12,
  rootMargin = "0px 0px -40px 0px",
}) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isVisible) return;

    const currentElement = elementRef.current;
    if (!currentElement || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            obs.unobserve(entry.target);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentElement);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, threshold, rootMargin]);

  return (
    <div
      ref={elementRef}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition-[opacity,transform] duration-700 ease-out will-change-[opacity,transform] ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-[20px]"
      } ${className}`}
    >
      {children}
    </div>
  );
};
