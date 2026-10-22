import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Utensils, Cake, Music, Clock } from "lucide-react";
import { motion } from "motion/react";
import { EventConfig, ScheduleItem } from "../config/eventConfig";

interface ProgramProps {
  config: EventConfig;
}

const STEP_ICONS = [Sparkles, Utensils, Cake, Music];
const EASE_UNFURL: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface TimelineStepCardProps {
  item: ScheduleItem;
  index: number;
  isActivated: boolean;
  stepProgress: number; // 0 à 1 sur le segment reliant cette étape à la suivante
  isLast: boolean;
  onRegisterNode: (index: number, el: HTMLLIElement | null) => void;
}

const TimelineStepCard: React.FC<TimelineStepCardProps> = ({
  item,
  index,
  isActivated,
  stepProgress,
  isLast,
  onRegisterNode,
}) => {
  const IconComponent = STEP_ICONS[index % STEP_ICONS.length];
  const hasTime = Boolean(item.time && item.time.trim().length > 0);

  return (
    <li
      ref={(el) => onRegisterNode(index, el)}
      className="group relative pl-16 sm:pl-28 pb-10 sm:pb-12 last:pb-0"
    >
      {/* Trait de liaison individuel entre cette étape et la suivante (s'illumine en orange au scroll) */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute left-6 sm:left-8 top-12 sm:top-16 bottom-0 w-[3px] -translate-x-1/2 bg-white/10 rounded-full overflow-hidden"
        >
          <div
            style={{ height: `${Math.max(0, Math.min(100, stepProgress * 100))}%` }}
            className="w-full bg-gradient-to-b from-[#F97316] via-[#FB923C] to-[#FFF1E6] shadow-[0_0_18px_rgba(249,115,22,0.95)] transition-[height] duration-150 ease-out"
          />
        </div>
      )}

      {/* Nœud lumineux de l'étape sur la ligne de progression avec animation au survol */}
      <div
        aria-hidden="true"
        className={`absolute left-0 top-2 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 z-10 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-[#F97316] group-hover:text-white group-hover:shadow-[0_0_36px_rgba(249,115,22,1)] ${
          isActivated
            ? "bg-[#F97316] text-white border-2 border-[#FFF1E6] shadow-[0_0_32px_rgba(249,115,22,0.9)] scale-105"
            : "bg-[#222222] text-white/40 border border-white/15 scale-95"
        }`}
      >
        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />

        {isActivated && (
          <span className="absolute -inset-1.5 rounded-2xl border border-[#F97316]/55 opacity-80 pointer-events-none transition-transform duration-300 group-hover:scale-105" />
        )}
      </div>

      {/* Connecteur horizontal ("attache du drapeau") qui s'allume en orange */}
      <div
        aria-hidden="true"
        className="absolute left-12 sm:left-16 top-8 sm:top-10 w-4 sm:w-12 h-[2px] bg-white/10 overflow-hidden"
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActivated ? 1 : 0 }}
          transition={{ duration: 0.45, ease: EASE_UNFURL }}
          style={{ transformOrigin: "left center" }}
          className="w-full h-full bg-gradient-to-r from-[#F97316] to-[#FFF1E6]"
        />
      </div>

      {/* Carte de l'étape qui se déroule comme un drapeau et réagit au survol (hover) */}
      <div style={{ perspective: "1200px" }}>
        <motion.div
          initial={{
            opacity: 0,
            scaleX: 0.65,
            rotateY: -18,
            x: -24,
            filter: "blur(6px)",
          }}
          animate={
            isActivated
              ? {
                  opacity: 1,
                  scaleX: 1,
                  rotateY: 0,
                  x: 0,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 0.18,
                  scaleX: 0.88,
                  rotateY: -10,
                  x: -12,
                  filter: "blur(2px)",
                }
          }
          whileHover={{
            y: -6,
            x: 6,
            scale: 1.015,
            transition: { duration: 0.2, ease: EASE_UNFURL },
          }}
          transition={{
            duration: 0.8,
            delay: isActivated ? 0.08 : 0,
            ease: EASE_UNFURL,
          }}
          style={{ transformOrigin: "left center" }}
          className={`relative rounded-[24px] p-6 sm:p-8 border transition-[border-color,box-shadow,background-color] duration-300 overflow-hidden cursor-default group-hover:border-[#F97316] group-hover:shadow-[0_24px_60px_rgba(249,115,22,0.22)] ${
            isActivated
              ? "bg-gradient-to-r from-[#26201B] via-[#222222] to-[#1E1E1E] border-[#F97316]/55 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
              : "bg-[#1E1E1E]/60 border-white/10"
          }`}
        >
          {/* Halo radial interne qui s'intensifie au survol */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 w-52 h-52 rounded-full bg-[#F97316]/0 group-hover:bg-[#F97316]/15 blur-2xl transition-colors duration-300"
          />

          {/* Liseré lumineux orange vertical côté mât qui s'élargit légèrement au survol */}
          <div
            aria-hidden="true"
            className={`absolute left-0 top-0 bottom-0 w-1.5 group-hover:w-2 transition-all duration-300 ${
              isActivated
                ? "bg-gradient-to-b from-[#FFF1E6] via-[#F97316] to-[#C2410C] opacity-100"
                : "bg-[#F97316] opacity-0 group-hover:opacity-100"
            }`}
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#F97316] transition-transform duration-200 group-hover:translate-x-1">
              Étape 0{index + 1}
            </span>
            {hasTime && (
              <span className="text-xs sm:text-sm font-medium text-[#FFFAF5]/90 tabular-nums">
                {item.time}
              </span>
            )}
          </div>

          <h3 className="relative z-10 font-editorial text-2xl sm:text-3xl font-semibold text-[#FFFAF5] transition-colors duration-200 group-hover:text-[#FFF1E6]">
            {item.title}
          </h3>

          <p className="relative z-10 mt-2.5 text-sm sm:text-base text-[#FFFAF5]/75 group-hover:text-[#FFFAF5]/90 leading-relaxed transition-colors duration-200">
            {item.description}
          </p>
        </motion.div>
      </div>
    </li>
  );
};

export const Program: React.FC<ProgramProps> = ({ config }) => {
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const stepElementsRef = useRef<(HTMLLIElement | null)[]>([]);
  const [continuousProgress, setContinuousProgress] = useState<number>(0.12);

  const hasSchedule =
    config.scheduleConfirmed && Array.isArray(config.schedule) && config.schedule.length > 0;

  const totalSteps = hasSchedule ? config.schedule.length : 0;

  const registerStepNode = (index: number, el: HTMLLIElement | null) => {
    stepElementsRef.current[index] = el;
  };

  // Calcul haute précision de la lumière de progression reliant les étapes lors du défilement
  useEffect(() => {
    if (!hasSchedule) return;

    let rafId: number | null = null;

    const updateProgress = () => {
      const container = timelineContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const triggerY = viewportHeight * 0.62;
      const distanceIntoTimeline = triggerY - rect.top;
      const totalHeight = Math.max(1, rect.height - 40);

      const normalized = Math.max(0.06, Math.min(1, distanceIntoTimeline / totalHeight));
      setContinuousProgress(normalized);
    };

    const onScrollOrResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [hasSchedule, totalSteps]);

  const floatStepPosition = continuousProgress * Math.max(1, totalSteps - 0.15);

  return (
    <section
      id="programme"
      className="py-20 sm:py-28 bg-[#181818] text-[#FFFAF5] relative overflow-hidden"
    >
      {/* Halo chaud d'ambiance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-[#F97316]/10 blur-3xl"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#F97316]">
            Déroulement de la soirée
          </p>
          <h2 className="mt-2 font-editorial text-3xl sm:text-5xl font-semibold text-[#FFFAF5] tracking-tight text-balance">
            Les temps forts de la célébration
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#FFFAF5]/75 leading-relaxed">
            Faites défiler pour suivre la lumière orange qui relie chaque étape de la fête.
          </p>
        </div>

        {!hasSchedule ? (
          <div className="mt-12 rounded-[24px] bg-white/5 border border-white/10 p-8 sm:p-12 text-center max-w-2xl mx-auto">
            <Clock className="w-8 h-8 text-[#F97316] mx-auto mb-4" />
            <p className="font-editorial text-2xl sm:text-3xl font-semibold text-[#FFFAF5]">
              Le programme détaillé sera communiqué prochainement.
            </p>
            <p className="mt-2 text-sm text-[#FFFAF5]/70">
              Les grandes étapes de la fête sont en cours de finalisation.
            </p>
          </div>
        ) : (
          <div ref={timelineContainerRef} className="mt-16 relative">
            {/* Faisceau principal continu ("lumière de progression") reliant toutes les étapes */}
            <div
              aria-hidden="true"
              className="absolute left-6 sm:left-8 top-6 bottom-10 w-[3px] -translate-x-1/2 bg-white/10 rounded-full pointer-events-none"
            >
              <div
                style={{ height: `${Math.min(100, Math.max(6, continuousProgress * 100))}%` }}
                className="relative w-full bg-gradient-to-b from-[#FFF1E6] via-[#F97316] to-[#F97316] rounded-full shadow-[0_0_22px_rgba(249,115,22,0.95)] transition-[height] duration-150 ease-out"
              >
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FFF1E6] border-2 border-[#F97316] shadow-[0_0_26px_8px_rgba(249,115,22,0.95)]" />
              </div>
            </div>

            <ol className="relative">
              {config.schedule.map((item, idx) => {
                const isActivated = idx === 0 || floatStepPosition >= idx - 0.08;
                const segmentProgress = Math.max(0, Math.min(1, floatStepPosition - idx));

                return (
                  <TimelineStepCard
                    key={item.id || idx}
                    item={item}
                    index={idx}
                    isActivated={isActivated}
                    stepProgress={segmentProgress}
                    isLast={idx === totalSteps - 1}
                    onRegisterNode={registerStepNode}
                  />
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
};
