export type ShareResult =
  | { status: "shared" }
  | { status: "copied"; url: string }
  | { status: "fallback"; url: string };

/**
 * Récupère l’URL réelle du site sans jamais inventer d’URL de production fictive.
 */
export function getActualSiteUrl(configuredUrl?: string): string {
  if (configuredUrl && configuredUrl.trim().length > 0) {
    return configuredUrl.trim();
  }
  if (typeof window !== "undefined" && window.location?.href) {
    return window.location.href.split("#")[0];
  }
  return "";
}

/**
 * Partage l’invitation via l’API Web Share si disponible, sinon copie l’URL dans le presse-papiers,
 * avec un repli propre si la copie échoue.
 */
export async function shareInvitation(
  celebrantName: string,
  configuredUrl?: string
): Promise<ShareResult> {
  const url = getActualSiteUrl(configuredUrl);
  const shareData = {
    title: `Joyeux anniversaire ${celebrantName}`,
    text: `Joyeux anniversaire ${celebrantName} ! Découvrez l’invitation et confirmez votre présence :`,
    url,
  };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(shareData);
      return { status: "shared" };
    } catch (err) {
      // Si l'utilisateur annule la feuille de partage native, ne pas afficher d'erreur bloquante
      if (err instanceof Error && err.name === "AbortError") {
        return { status: "shared" };
      }
      // Continuer vers la copie presse-papiers si navigator.share échoue en iframe
    }
  }

  const copied = await copyTextToClipboard(url);
  if (copied) {
    return { status: "copied", url };
  }

  return { status: "fallback", url };
}

/**
 * Copie un texte quelconque dans le presse-papiers avec solution de repli.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Repli ci-dessous
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
