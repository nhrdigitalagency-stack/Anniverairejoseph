import React, { useState, useEffect, useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { EventConfig } from "../config/eventConfig";
import { parseValidDate, formatEventDate } from "../utils/calendar";

interface CountdownProps {
  config: EventConfig;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Countdown: React.FC<CountdownProps> = ({ config }) => {
  // Si aucune date n'est définie ou si la date configurée est déjà passée, utiliser une cible de 10 jours glissants
  const fallbackTenDaysDate = useMemo(
    () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    []
  );

  const configuredStart = parseValidDate(config.eventStart);
  const startDate =
    configuredStart && configuredStart.getTime() > Date.now()
      ? configuredStart
      : fallbackTenDaysDate;

  const endDate = parseValidDate(config.eventEnd);

  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!startDate) {
    return (
      <section aria-label="Annonce de la date" className="py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-[#FFF1E6]/70 border border-[#EADFD5] px-6 py-6 sm:px-10 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EADFD5] flex items-center justify-center text-[#F97316] shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-[#181818]">
                  La date sera annoncée prochainement
                </p>
                <p className="text-sm text-[#666666]">
                  Vous pouvez dès maintenant pré-confirmer votre présence ou laisser un mot à{" "}
                  {config.celebrantName}.
                </p>
              </div>
            </div>
            <a
              href="#confirmation"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#C2410C] bg-white hover:bg-[#FFFAF5] border border-[#EADFD5] rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Répondre dès maintenant
            </a>
          </div>
        </div>
      </section>
    );
  }

  const startMs = startDate.getTime();
  const endMs =
    endDate && endDate.getTime() > startMs
      ? endDate.getTime()
      : startMs + 5 * 60 * 60 * 1000;

  if (now >= endMs) {
    return (
      <section aria-label="Statut de la célébration" className="py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-[#181818] text-[#FFFAF5] px-6 py-7 sm:px-10 sm:py-8 text-center">
            <p className="font-editorial text-2xl sm:text-3xl font-semibold">
              Merci à tous d’avoir partagé ce moment inoubliable.
            </p>
            <p className="mt-2 text-sm text-[#FFFAF5]/75">
              Vous pouvez toujours envoyer un message ou un souvenir à {config.celebrantName} sur WhatsApp.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (now >= startMs && now < endMs) {
    return (
      <section aria-label="Célébration en cours" className="py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-[#181818] text-[#FFFAF5] px-6 py-7 sm:px-10 sm:py-8 text-center border border-[#F97316]/40">
            <p className="text-xs font-semibold tracking-wider text-[#F97316] mb-1">
              C’est le moment
            </p>
            <p className="font-editorial text-2xl sm:text-3xl font-semibold">
              La célébration de l’anniversaire de {config.celebrantName} a commencé !
            </p>
          </div>
        </div>
      </section>
    );
  }

  const diffSeconds = Math.max(0, Math.floor((startMs - now) / 1000));
  const timeRemaining: TimeRemaining = {
    days: Math.floor(diffSeconds / 86400),
    hours: Math.floor((diffSeconds % 86400) / 3600),
    minutes: Math.floor((diffSeconds % 3600) / 60),
    seconds: diffSeconds % 60,
  };

  const formattedTargetDate = formatEventDate(startDate.toISOString(), config.timeZone);

  const units = [
    { label: "Jours", value: timeRemaining.days },
    { label: "Heures", value: timeRemaining.hours },
    { label: "Minutes", value: timeRemaining.minutes },
    { label: "Secondes", value: timeRemaining.seconds },
  ];

  return (
    <section aria-label="Compte à rebours avant l’événement" className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[#181818] text-[#FFFAF5] p-7 sm:p-11 shadow-[0_24px_60px_rgba(24,24,24,0.16)] border border-white/10">
          {/* Halo orange subtil dans le bloc compte à rebours */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#F97316]/15 blur-3xl"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left max-w-md">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-[#F97316]">
                Compte à rebours · J-{timeRemaining.days}
              </span>
              <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-semibold text-[#FFFAF5] leading-tight">
                Plus que quelques instants avant de célébrer ensemble
              </h2>
              {formattedTargetDate && (
                <p className="mt-2 text-sm text-[#FFFAF5]/75 capitalize">
                  Rendez-vous le {formattedTargetDate}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full lg:w-auto">
              {units.map((unit) => (
                <div
                  key={unit.label}
                  className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-[22px] px-3 py-4 sm:px-6 sm:py-5 text-center min-w-[72px] sm:min-w-[104px] shadow-inner"
                >
                  <span className="block font-poppins text-3xl sm:text-5xl font-bold text-[#F97316] tabular-nums tracking-tight">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="mt-1.5 block text-[11px] sm:text-xs font-medium uppercase tracking-wider text-[#FFFAF5]/80">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
