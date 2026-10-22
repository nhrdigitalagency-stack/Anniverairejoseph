import { eventConfig } from "../config/eventConfig";

/**
 * Construit une URL WhatsApp sécurisée et encodée vers le numéro de l’organisation.
 * Format strict : https://wa.me/33753049353?text={messageEncode}
 */
export function buildWhatsAppUrl(message: string, customNumber?: string): string {
  const rawNumber = (customNumber || eventConfig.whatsappNumber || "33753049353").replace(/[^\d]/g, "");
  const cleanMessage = message.trim();
  const encodedText = encodeURIComponent(cleanMessage);
  return `https://wa.me/${rawNumber}?text=${encodedText}`;
}

export interface RSVPMessagePayload {
  prenom: string;
  nom?: string;
  presence: "Oui" | "Non" | "Peut-être";
  accompagnants?: number;
  prenomsAccompagnants?: string;
  preferencesAlimentaires?: string;
  message?: string;
   includeCompanions?: boolean;
}

/**
 * Génère le message de confirmation de présence sans lignes facultatives vides.
 */
export function formatRSVPWhatsAppMessage(payload: RSVPMessagePayload): string {
  const lines: string[] = [
    "Bonjour, voici ma réponse pour l’anniversaire de Joseph.",
    "",
    `Prénom : ${payload.prenom.trim()}`,
  ];

  if (payload.nom && payload.nom.trim().length > 0) {
    lines.push(`Nom : ${payload.nom.trim()}`);
  }

  lines.push(`Présence : ${payload.presence}`);

  if (
    payload.presence !== "Non" &&
    payload.includeCompanions &&
    typeof payload.accompagnants === "number"
  ) {
    lines.push(`Accompagnants : ${payload.accompagnants}`);
    if (
      payload.accompagnants > 0 &&
      payload.prenomsAccompagnants &&
      payload.prenomsAccompagnants.trim().length > 0
    ) {
      lines.push(`Prénoms des accompagnants : ${payload.prenomsAccompagnants.trim()}`);
    }
  }

  if (payload.preferencesAlimentaires && payload.preferencesAlimentaires.trim().length > 0) {
    lines.push(`Préférences alimentaires : ${payload.preferencesAlimentaires.trim()}`);
  }

  if (payload.message && payload.message.trim().length > 0) {
    lines.push(`Message : ${payload.message.trim()}`);
  }

  return lines.join("\n");
}

/**
 * Génère le message d’anniversaire privé pour Joseph.
 */
export function formatBirthdayWishMessage(prenom: string, message: string): string {
  return [
    "Bonjour Joseph, joyeux anniversaire !",
    "",
    `De la part de : ${prenom.trim()}`,
    "",
    message.trim(),
  ].join("\n");
}

/**
 * Génère le message pour proposer un cadeau, une surprise ou poser une question.
 */
export function formatGiftSurpriseMessage(
  prenom: string,
  objet: "Cadeau" | "Surprise" | "Autre question",
  message: string
): string {
  return [
    "Bonjour, je vous contacte au sujet d’une attention pour l’anniversaire de Joseph.",
    "",
    `Prénom : ${prenom.trim()}`,
    `Objet : ${objet}`,
    `Message : ${message.trim()}`,
  ].join("\n");
}

/**
 * Message de contact général pour l’organisation.
 */
export function getGeneralContactMessage(): string {
  return "Bonjour, je vous contacte au sujet de l’anniversaire de Joseph.";
}

/**
 * Message pour prévenir d’une modification de réponse.
 */
export function getModificationContactMessage(): string {
  return "Bonjour, je souhaite modifier ma réponse concernant ma présence à l’anniversaire de Joseph.\n\nPrénom : \nNouvelle réponse : ";
}

/**
 * Message pour proposer une photo de souvenir sur WhatsApp.
 */
export function getProposePhotoMessage(): string {
  return "Bonjour, je souhaite partager une photo souvenir pour l’anniversaire de Joseph (je joins l’image directement dans cette conversation).";
}
