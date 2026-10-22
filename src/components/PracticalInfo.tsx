import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Shirt,
  Car,
  CalendarPlus,
  Check,
  ExternalLink,
} from "lucide-react";
import { EventConfig } from "../config/eventConfig";
import {
  formatEventDate,
  formatEventTime,
  canGenerateICS,
  generateICSFile,
  getDirectionsUrl,
  getGoogleMapsEmbedUrl,
} from "../utils/calendar";

interface PracticalInfoProps {
  config: EventConfig;
  onOpenAdminModal?: () => void;
}

export const PracticalInfo: React.FC<PracticalInfoProps> = ({ config, onOpenAdminModal }) => {
  const [icsDownloaded, setIcsDownloaded] = useState(false);

  const formattedStartDate = formatEventDate(config.eventStart, config.timeZone);
  const formattedEndDate = formatEventDate(config.eventEnd, config.timeZone);
  const formattedStartTime = formatEventTime(config.eventStart, config.timeZone);
  const formattedEndTime = formatEventTime(config.eventEnd, config.timeZone);

  const dateDisplay = formattedStartDate
    ? formattedEndDate && formattedEndDate !== formattedStartDate
      ? `Du ${formattedStartDate} au ${formattedEndDate}`
      : formattedStartDate
    : null;

  const timeDisplay = formattedStartTime
    ? formattedEndTime
      ? `De ${formattedStartTime} à ${formattedEndTime}`
      : `À partir de ${formattedStartTime}`
    : null;

  const directionsUrl = getDirectionsUrl(config);
  const mapsEmbedUrl = getGoogleMapsEmbedUrl(config);
  const isIcsAvailable = canGenerateICS(config);

  const handleAddToCalendar = () => {
    const content = generateICSFile(config, true);
    if (content) {
      setIcsDownloaded(true);
      window.setTimeout(() => setIcsDownloaded(false), 4000);
    }
  };

  const infoCards = [
    {
      label: "Date",
      value: dateDisplay ? dateDisplay : "Date à confirmer",
      isConfirmed: Boolean(dateDisplay),
      icon: Calendar,
    },
    {
      label: "Heure",
      value: timeDisplay ? timeDisplay : "Date à confirmer",
      isConfirmed: Boolean(timeDisplay),
      icon: Clock,
    },
    {
      label: "Lieu",
      value: config.venueName.trim() ? config.venueName.trim() : "Lieu communiqué prochainement",
      isConfirmed: Boolean(config.venueName.trim()),
      icon: MapPin,
    },
    {
      label: "Adresse",
      value: config.address.trim() ? config.address.trim() : "Lieu communiqué prochainement",
      isConfirmed: Boolean(config.address.trim()),
      icon: Navigation,
    },
    {
      label: "Dress code",
      value: config.dressCode.trim() ? config.dressCode.trim() : "Détails à venir",
      isConfirmed: Boolean(config.dressCode.trim()),
      icon: Shirt,
    },
    {
      label: "Accès et stationnement",
      value: config.accessAndParking.trim() ? config.accessAndParking.trim() : "Détails à venir",
      isConfirmed: Boolean(config.accessAndParking.trim()),
      icon: Car,
    },
  ];

  const locationSummary = [config.venueName.trim(), config.address.trim()]
    .filter(Boolean)
    .join(" · ");

  return (
    <section id="infos" className="py-16 sm:py-24 border-b border-[#EADFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#C2410C]">
              Informations pratiques
            </p>
            <h2 className="mt-2 font-editorial text-3xl sm:text-5xl font-semibold text-[#181818] tracking-tight text-balance">
              Tout savoir pour nous rejoindre
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#666666] leading-relaxed">
              Retrouvez ici les repères essentiels, l’emplacement et le fichier d’agenda pour
              préparer votre venue en toute sérénité.
            </p>
          </div>

          {/* Boutons rapides : Ajouter à mon agenda & Ouvrir l’itinéraire */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isIcsAvailable ? (
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="btn-interactive group inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#181818] bg-white hover:bg-[#FFF1E6] border border-[#EADFD5] hover:border-[#F97316] rounded-xl hover:shadow-[0_10px_24px_rgba(249,115,22,0.14)] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                {icsDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-[#C2410C]" />
                    <span>Fichier .ics téléchargé</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4 text-[#F97316] transition-transform duration-200 group-hover:scale-110" />
                    <span>Ajouter à mon agenda</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Disponible dès que les dates sont configurées"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#666666] bg-white/70 border border-[#EADFD5] rounded-xl cursor-not-allowed opacity-75 whitespace-nowrap shrink-0"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Ajouter à mon agenda</span>
              </button>
            )}

            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-interactive group inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#C2410C] rounded-xl shadow-[0_8px_20px_rgba(249,115,22,0.25)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.4)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                <Navigation className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span>Ouvrir l’itinéraire</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="L’adresse sera communiquée prochainement"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#666666] bg-white/70 border border-[#EADFD5] rounded-xl cursor-not-allowed opacity-75 whitespace-nowrap shrink-0"
              >
                <Navigation className="w-4 h-4" />
                <span>Ouvrir l’itinéraire</span>
              </button>
            )}
          </div>
        </div>

        {/* Grille des 6 cartes d'informations */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {infoCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.label}
                className="group rounded-[24px] bg-white border border-[#EADFD5] hover:border-[#F97316]/50 p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,24,24,0.03)] hover:shadow-[0_16px_40px_rgba(249,115,22,0.1)] transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className="text-xs font-semibold tracking-wider text-[#666666] group-hover:text-[#C2410C] transition-colors">
                      {card.label}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] group-hover:bg-[#F97316] text-[#C2410C] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>

                  <p
                    className={`font-editorial text-2xl font-semibold leading-snug ${
                      card.isConfirmed ? "text-[#181818] capitalize" : "text-[#666666] italic"
                    }`}
                  >
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carte Google Maps de l'emplacement */}
        <div className="mt-10 rounded-[28px] bg-white border border-[#EADFD5] overflow-hidden shadow-[0_12px_36px_rgba(24,24,24,0.04)]">
          <div className="p-6 sm:p-8 border-b border-[#EADFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFAF5]">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF1E6] text-[#C2410C] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181818]">
                  Carte & Emplacement de la fête
                </h3>
                <p className="mt-1 text-sm text-[#666666]">
                  {locationSummary
                    ? locationSummary
                    : "Lieu communiqué prochainement — la carte interactive s’affichera automatiquement dès que l’adresse sera configurée."}
                </p>
              </div>
            </div>

            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#C2410C] bg-[#FFF1E6] hover:bg-[#F97316] hover:text-white rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                <span>Voir sur Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {mapsEmbedUrl ? (
            <div className="relative w-full h-[340px] sm:h-[420px] bg-[#FFF1E6]/40">
              <iframe
                title={`Carte Google Maps pour l’anniversaire de ${config.celebrantName}`}
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          ) : (
            /* État propre et élégant tant que l'adresse n'est pas renseignée dans eventConfig */
            <div className="relative w-full py-14 sm:py-16 px-6 bg-gradient-to-br from-[#FFF1E6]/60 via-[#FFFAF5] to-[#FFF1E6]/40 flex flex-col items-center justify-center text-center">
              <div
                aria-hidden="true"
                className="w-16 h-16 rounded-full bg-white border border-[#EADFD5] shadow-xs flex items-center justify-center text-[#F97316] mb-4"
              >
                <MapPin className="w-7 h-7" />
              </div>
              <p className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181818]">
                Emplacement en cours de confirmation
              </p>
              <p className="mt-2 text-sm text-[#666666] max-w-md">
                Dès que le lieu ou l’adresse sera renseigné dans la configuration de l’événement,
                la carte Google Maps interactive s’affichera directement dans cet espace.
              </p>
              {onOpenAdminModal && (
                <button
                  type="button"
                  onClick={onOpenAdminModal}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FFF1E6] border border-[#EADFD5] text-xs font-semibold text-[#C2410C] transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Configurer une adresse pour afficher Google Maps</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
