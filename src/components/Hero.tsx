import React, { useState } from "react";
import { ArrowRight, Calendar, Clock, MapPin, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { EventConfig } from "../config/eventConfig";
import { formatEventDate, formatEventTime } from "../utils/calendar";

interface HeroProps {
  config: EventConfig;
}

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const Hero: React.FC<HeroProps> = ({ config }) => {
  const [imageError, setImageError] = useState(false);

  const formattedDate = formatEventDate(config.eventStart, config.timeZone);
  const formattedTime = formatEventTime(config.eventStart, config.timeZone);
  const hasVenue = Boolean(config.venueName && config.venueName.trim().length > 0);
  const hasConfiguredMeta = Boolean(formattedDate || formattedTime || hasVenue);

  const showPhoto = Boolean(
    config.portraitUrl && config.portraitUrl.trim().length > 0 && !imageError
  );

  return (
    <section
      id="accueil"
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#181818] text-white font-poppins select-none"
    >
      {/* 1. Image de fond plein écran (Fullscreen Hero) avec animation cinématique Ken Burns */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {showPhoto ? (
          <motion.img
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease: EASE_LUXURY }}
            src={config.portraitUrl}
            alt={`Portrait de ${config.celebrantName}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-[center_18%] sm:object-[center_20%]"
          />
        ) : (
          /* Composition typographique et abstraite plein écran si aucune photo n'est fournie */
          <div className="w-full h-full bg-gradient-to-br from-[#181818] via-[#26170E] to-[#181818] relative flex items-center justify-center">
            <div
              aria-hidden="true"
              className="w-[45rem] h-[45rem] rounded-full border border-[#F97316]/20 blur-sm"
            />
          </div>
        )}

        {/* 2. Superposition arrière-plan en noir fumé adoucie pour sublimer le portrait */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#181818]/90 via-[#181818]/30 to-black/20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"
        />
        {/* Halo chaud orange signature ultra-subtil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 w-[40rem] h-[40rem] rounded-full bg-[#F97316]/15 blur-[130px]"
        />
      </div>

      {/* Espaceur supérieur pour le header transparent */}
      <div className="h-24 sm:h-28 shrink-0 relative z-10" />

      {/* 3. Contenu principal en Poppins par-dessus le noir fumé avec animations haute couture */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            {/* Petit label avec ligne lumineuse animée */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE_LUXURY }}
              className="flex items-center gap-3 mb-5"
            >
              <span aria-hidden="true" className="w-10 h-[2px] bg-[#F97316]" />
              <span className="font-poppins text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-[#F97316]">
                Une invitation à célébrer
              </span>
            </motion.div>

            {/* Grand titre H1 en Poppins avec révélation masquée */}
            <h1 className="font-poppins text-white tracking-tight">
              <span className="block overflow-hidden pb-2">
                <motion.span
                  initial={{ y: "105%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1.1, delay: 0.25, ease: EASE_LUXURY }}
                  className="block text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-extrabold leading-[0.98] tracking-tight"
                >
                  {config.celebrantName}
                  <span className="text-[#F97316]">.</span>
                </motion.span>
              </span>

              <span className="block overflow-hidden mt-3 sm:mt-4">
                <motion.span
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1.1, delay: 0.42, ease: EASE_LUXURY }}
                  className="block text-2xl sm:text-4xl lg:text-[2.65rem] font-light text-white/95 leading-[1.22] text-balance"
                >
                  Une année de plus.{" "}
                  <span className="font-medium text-[#FFF1E6]">Un moment à partager.</span>
                </motion.span>
              </span>
            </h1>

            {/* Texte d'invitation en Poppins */}
            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: EASE_LUXURY }}
              className="mt-6 sm:mt-8 font-poppins text-base sm:text-lg lg:text-xl font-light text-white/80 leading-relaxed max-w-2xl"
            >
              Une soirée, des sourires et ceux qui comptent. Rejoignez-moi pour célébrer une
              nouvelle année et créer de beaux souvenirs ensemble.
            </motion.p>

            {/* Boutons d'action avec micro-interactions de luxe */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.78, ease: EASE_LUXURY }}
              className="mt-9 sm:mt-11 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <a
                href="#confirmation"
                className="btn-interactive group inline-flex items-center justify-center gap-3 px-8 py-4.5 text-base font-semibold text-white bg-[#F97316] hover:bg-[#C2410C] rounded-2xl shadow-[0_14px_40px_rgba(249,115,22,0.38)] hover:shadow-[0_20px_52px_rgba(249,115,22,0.6)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                <span>Je confirme ma présence</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </a>

              <a
                href="#programme"
                className="btn-interactive group inline-flex items-center justify-center gap-2 px-8 py-4.5 text-base font-medium text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-[#F97316]/70 rounded-2xl hover:shadow-[0_12px_36px_rgba(0,0,0,0.35)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                <span>Découvrir le programme</span>
              </a>
            </motion.div>

            {/* Informations de date, heure et lieu uniquement si elles sont configurées */}
            {hasConfiguredMeta && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.95, ease: EASE_LUXURY }}
                className="mt-10 pt-7 border-t border-white/15 flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-white/85"
              >
                {formattedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span className="capitalize font-medium">{formattedDate}</span>
                  </div>
                )}

                {formattedDate && (formattedTime || hasVenue) && (
                  <span aria-hidden="true" className="text-white/30">
                    ·
                  </span>
                )}

                {formattedTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span className="font-medium tabular-nums">{formattedTime}</span>
                  </div>
                )}

                {formattedTime && hasVenue && (
                  <span aria-hidden="true" className="text-white/30">
                    ·
                  </span>
                )}

                {hasVenue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span className="font-medium">{config.venueName}</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Carte superposée "Célébrons ensemble" en verre fumé à droite */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.9, ease: EASE_LUXURY }}
            className="lg:col-span-4 flex lg:justify-end"
          >
            <div className="bg-black/45 backdrop-blur-xl border border-white/15 rounded-[24px] p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-w-xs w-full">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-medium tracking-wider uppercase text-[#F97316]">
                  Édition privée
                </span>
                <span aria-hidden="true" className="w-6 h-[1px] bg-white/30" />
              </div>
              <p className="font-poppins text-xl sm:text-2xl font-semibold text-white leading-snug">
                Célébrons ensemble
              </p>
              <p className="mt-2 font-poppins text-xs sm:text-sm font-light text-white/75 leading-relaxed">
                Votre présence est le plus beau des cadeaux pour marquer cette nouvelle année.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Indicateur de défilement discret en bas de l'écran */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.2 }}
        className="relative z-10 pb-6 sm:pb-8 flex justify-center"
      >
        <a
          href="#celebration"
          aria-label="Découvrir la suite de l’invitation"
          className="group inline-flex flex-col items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-white/60 hover:text-white transition-colors"
        >
          <span>Découvrir</span>
          <ChevronDown className="w-4 h-4 text-[#F97316] transition-transform duration-300 group-hover:translate-y-1" />
        </a>
      </motion.div>
    </section>
  );
};
