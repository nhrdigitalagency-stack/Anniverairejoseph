import { EventConfig } from "../config/eventConfig";

/**
 * Vérifie si une chaîne ISO représente une date valide.
 */
export function parseValidDate(isoString: string | null | undefined): Date | null {
  if (!isoString || typeof isoString !== "string" || isoString.trim() === "") {
    return null;
  }
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

/**
 * Formate une date en français de façon élégante en tenant compte du fuseau configuré.
 */
export function formatEventDate(
  isoString: string | null | undefined,
  timeZone?: string | null
): string | null {
  const date = parseValidDate(isoString);
  if (!date) return null;

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
}

/**
 * Formate l’heure d’une date ISO en français (ex: "19h30").
 */
export function formatEventTime(
  isoString: string | null | undefined,
  timeZone?: string | null
): string | null {
  const date = parseValidDate(isoString);
  if (!date) return null;

  try {
    const formatted = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
    return formatted.replace(":", "h");
  } catch {
    const formatted = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
    return formatted.replace(":", "h");
  }
}

/**
 * Échappe les caractères spéciaux selon la norme RFC 5545 pour les fichiers .ics.
 */
function escapeICSValue(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Convertit un objet Date en format UTC pour iCalendar (YYYYMMDDTHHMMSSZ).
 */
function toICSDateUTC(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Indique si les dates configurées permettent de générer un fichier .ics valide.
 */
export function canGenerateICS(config: EventConfig): boolean {
  const startDate = parseValidDate(config.eventStart);
  if (!startDate) return false;

  if (config.eventEnd && config.eventEnd.trim() !== "") {
    const endDate = parseValidDate(config.eventEnd);
    if (!endDate || endDate.getTime() < startDate.getTime()) {
      return false;
    }
  }

  return true;
}

/**
 * Génère le contenu d’un fichier .ics conforme RFC 5545 (et déclenche son téléchargement si download = true)
 * en utilisant uniquement les informations et dates définies dans `config`.
 */
export function generateICSFile(config: EventConfig, triggerDownload = true): string | null {
  const startDate = parseValidDate(config.eventStart);
  if (!startDate) return null;

  const endDate = parseValidDate(config.eventEnd);
  if (
    config.eventEnd &&
    config.eventEnd.trim() !== "" &&
    (!endDate || endDate.getTime() < startDate.getTime())
  ) {
    return null;
  }

  const dtStart = toICSDateUTC(startDate);
  const summary = `L’anniversaire de ${config.celebrantName}`;

  const descriptionParts: string[] = [
    `Célébration de l’anniversaire de ${config.celebrantName}.`,
    "Une soirée, des sourires et ceux qui comptent.",
  ];

  if (config.dressCode.trim()) {
    descriptionParts.push(`Dress code : ${config.dressCode.trim()}`);
  }
  if (config.whatsappDisplayNumber.trim()) {
    descriptionParts.push(`Contact WhatsApp organisation : ${config.whatsappDisplayNumber.trim()}`);
  }

  const locationParts = [config.venueName.trim(), config.address.trim()].filter(Boolean);
  const locationString = locationParts.join(" — ");

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitation Privee//Joseph//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:anniversaire-joseph-${startDate.getTime()}@invitation.local`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
  ];

  if (endDate && endDate.getTime() >= startDate.getTime()) {
    icsLines.push(`DTEND:${toICSDateUTC(endDate)}`);
  }

  icsLines.push(
    `SUMMARY:${escapeICSValue(summary)}`,
    `DESCRIPTION:${escapeICSValue(descriptionParts.join("\n"))}`
  );

  if (locationString) {
    icsLines.push(`LOCATION:${escapeICSValue(locationString)}`);
  }

  icsLines.push("END:VEVENT", "END:VCALENDAR");

  const icsContent = icsLines.join("\r\n");

  if (triggerDownload && typeof window !== "undefined" && typeof document !== "undefined") {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `anniversaire-${config.celebrantName.toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return icsContent;
}

/**
 * Construit le lien d’itinéraire Google Maps uniquement si un lien ou une adresse réelle est configuré.
 */
export function getDirectionsUrl(config: EventConfig): string | null {
  if (config.mapsUrl && config.mapsUrl.trim().length > 0) {
    return config.mapsUrl.trim();
  }
  const queryParts = [config.venueName.trim(), config.address.trim()].filter(Boolean);
  if (queryParts.length > 0) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      queryParts.join(", ")
    )}`;
  }
  return null;
}

/**
 * Construit l’URL d’intégration (iframe) Google Maps pour l’emplacement configuré.
 * Retourne null si aucun lieu ni adresse n’est renseigné afin de ne jamais afficher un emplacement fictif.
 */
export function getGoogleMapsEmbedUrl(config: EventConfig): string | null {
  const queryParts = [config.venueName.trim(), config.address.trim()].filter(Boolean);
  if (queryParts.length > 0) {
    const encodedQuery = encodeURIComponent(queryParts.join(", "));
    return `https://maps.google.com/maps?q=${encodedQuery}&t=m&z=15&output=embed&iwloc=near`;
  }

  // Si seul mapsUrl est renseigné, tenter d'extraire une requête ou utiliser l'URL si c'est déjà un lien embed
  if (config.mapsUrl && config.mapsUrl.trim().length > 0) {
    const trimmed = config.mapsUrl.trim();
    if (trimmed.includes("output=embed") || trimmed.includes("/maps/embed")) {
      return trimmed;
    }
    try {
      const parsedUrl = new URL(trimmed);
      const qParam = parsedUrl.searchParams.get("q") || parsedUrl.searchParams.get("query");
      if (qParam) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(qParam)}&t=m&z=15&output=embed&iwloc=near`;
      }
    } catch {
      // Ignorer si l'URL n'est pas standard
    }
  }

  return null;
}
