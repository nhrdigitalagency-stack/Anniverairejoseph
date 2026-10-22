import React, { useState, useEffect, useMemo } from "react";
import {
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { EventConfig } from "../config/eventConfig";
import { buildWhatsAppUrl, formatRSVPWhatsAppMessage } from "../utils/whatsapp";
import { validateRSVPInput, ValidationErrors } from "../utils/validation";
import { copyTextToClipboard } from "../utils/share";
import { formatEventDate } from "../utils/calendar";

interface RSVPFormProps {
  config: EventConfig;
}

interface GiftParticle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
  emoji: string;
}

/**
 * Déclenche une animation festive de 3 secondes combinant des confettis aux couleurs
 * de l’invitation et des formes d’émojis cadeaux via `canvas-confetti`.
 */
function triggerThreeSecondCelebrationConfetti(): () => void {
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    return () => {};
  }

  const durationMs = 3000;
  const endTime = Date.now() + durationMs;
  const brandColors = ["#F97316", "#C2410C", "#FFF1E6", "#FBBF24", "#FFFFFF"];

  // Création de formes personnalisées d'émojis cadeaux si shapeFromText est supporté
  let customShapes: confetti.Shape[] | undefined;
  if (typeof confetti.shapeFromText === "function") {
    try {
      const giftShape = confetti.shapeFromText({ text: "🎁", scalar: 2.2 });
      const partyShape = confetti.shapeFromText({ text: "🎉", scalar: 2 });
      const sparkleShape = confetti.shapeFromText({ text: "✨", scalar: 1.8 });
      customShapes = [giftShape, partyShape, sparkleShape];
    } catch {
      customShapes = undefined;
    }
  }

  // Salve initiale centrale dès la soumission
  confetti({
    particleCount: 65,
    spread: 80,
    origin: { y: 0.25 },
    colors: brandColors,
    zIndex: 9999,
  });

  // Pluie continue du haut vers le bas pendant 3 secondes
  const intervalId = window.setInterval(() => {
    const timeLeft = endTime - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(intervalId);
      return;
    }

    // Pluie de confettis dorés et oranges depuis le haut de l'écran
    confetti({
      particleCount: 10,
      angle: 270,
      spread: 110,
      origin: { x: Math.random(), y: -0.05 },
      colors: brandColors,
      gravity: 1.05,
      scalar: 1.05,
      drift: (Math.random() - 0.5) * 0.8,
      ticks: 240,
      zIndex: 9999,
    });

    // Pluie d'émojis cadeaux via canvas-confetti
    if (customShapes && customShapes.length > 0) {
      confetti({
        particleCount: 3,
        angle: 270,
        spread: 90,
        origin: { x: Math.random() * 0.8 + 0.1, y: -0.05 },
        shapes: customShapes,
        scalar: 2.1,
        gravity: 0.95,
        flat: true,
        ticks: 240,
        zIndex: 9999,
      });
    }
  }, 190);

  return () => {
    window.clearInterval(intervalId);
  };
}

export const RSVPForm: React.FC<RSVPFormProps> = ({ config }) => {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [presence, setPresence] = useState<"Oui" | "Non" | "Peut-être">("Oui");
  const [accompagnants, setAccompagnants] = useState<number>(0);
  const [prenomsAccompagnants, setPrenomsAccompagnants] = useState("");
  const [preferencesAlimentaires, setPreferencesAlimentaires] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [preparedState, setPreparedState] = useState<{
    whatsappUrl: string;
    rawMessage: string;
  } | null>(null);
  const [copiedFallback, setCopiedFallback] = useState(false);

  // État pour la boîte de dialogue festive de 3 secondes avec pluie de cadeaux + canvas-confetti
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    guestName: string;
    whatsappUrl: string;
    presenceChoice: "Oui" | "Non" | "Peut-être";
  } | null>(null);

  const showCompanionsField = config.allowCompanions && presence !== "Non";
  const rsvpDeadlineFormatted = formatEventDate(config.rsvpDeadline, config.timeZone);

  // Émojis cadeaux complémentaires tombant du haut vers le bas
  const giftParticles: GiftParticle[] = useMemo(() => {
    const emojis = ["🎁", "🎁", "🎁", "🎉", "✨"];
    return Array.from({ length: 30 }, (_, idx) => ({
      id: idx,
      left: ((idx * 97) % 96) + 2,
      delay: ((idx * 13) % 15) * 0.08,
      duration: 1.8 + ((idx * 7) % 10) * 0.12,
      size: 24 + ((idx * 11) % 16),
      rotate: (idx % 2 === 0 ? 1 : -1) * (15 + ((idx * 19) % 45)),
      emoji: emojis[idx % emojis.length],
    }));
  }, []);

  const buildCurrentMessage = () =>
    formatRSVPWhatsAppMessage({
      prenom,
      nom,
      presence,
      accompagnants: showCompanionsField ? accompagnants : undefined,
      prenomsAccompagnants:
        showCompanionsField && accompagnants > 0 ? prenomsAccompagnants : undefined,
      preferencesAlimentaires: presence !== "Non" ? preferencesAlimentaires : undefined,
      message,
      includeCompanions: showCompanionsField,
    });

  const openWhatsAppUrl = (url: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.location.href = url;
  };

  // Déclenchement de canvas-confetti et du minuteur de 3 secondes avant la redirection vers WhatsApp
  useEffect(() => {
    if (!celebrationModal?.isOpen) return;

    const stopConfetti = triggerThreeSecondCelebrationConfetti();

    const timer = window.setTimeout(() => {
      const targetUrl = celebrationModal.whatsappUrl;
      setCelebrationModal((prev) => (prev ? { ...prev, isOpen: false } : null));
      openWhatsAppUrl(targetUrl);
    }, 3000);

    return () => {
      stopConfetti();
      window.clearTimeout(timer);
    };
  }, [celebrationModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRSVPInput({
      prenom,
      presence,
      accompagnants: showCompanionsField ? accompagnants : 0,
      maxCompanions: config.maxCompanions,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const rawMessage = buildCurrentMessage();
    const whatsappUrl = buildWhatsAppUrl(rawMessage, config.whatsappNumber);
    setPreparedState({ whatsappUrl, rawMessage });

    const cleanGuestName = prenom.trim();

    if (presence !== "Non") {
      // Déclencher les 3 secondes de confettis/cadeaux + boîte de dialogue personnalisée avant d'ouvrir WhatsApp
      setCelebrationModal({
        isOpen: true,
        guestName: cleanGuestName,
        whatsappUrl,
        presenceChoice: presence,
      });
    } else {
      openWhatsAppUrl(whatsappUrl);
    }
  };

  const handleCopyMessage = async () => {
    const textToCopy = preparedState?.rawMessage || buildCurrentMessage();
    const ok = await copyTextToClipboard(textToCopy);
    if (ok) {
      setCopiedFallback(true);
      window.setTimeout(() => setCopiedFallback(false), 3500);
    }
  };

  const companionOptions = Array.from(
    { length: Math.max(0, config.maxCompanions) + 1 },
    (_, i) => i
  );

  return (
    <section id="confirmation" className="py-16 sm:py-24 bg-[#FFF1E6]/45 border-b border-[#EADFD5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#C2410C]">
            Confirmation de présence
          </p>
          <h2 className="mt-2 font-editorial text-3xl sm:text-5xl font-semibold text-[#181818] tracking-tight text-balance">
            Serez-vous des nôtres ?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#666666] leading-relaxed">
            Merci de renseigner ces quelques informations pour préparer votre venue.
            {rsvpDeadlineFormatted && (
              <span className="block mt-1 font-medium text-[#181818]">
                Réponse souhaitée avant le {rsvpDeadlineFormatted}.
              </span>
            )}
          </p>
        </div>

        <div className="mt-10 rounded-[28px] bg-white border border-[#EADFD5] p-6 sm:p-10 shadow-[0_16px_40px_rgba(24,24,24,0.05)]">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Prénom & Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="rsvp-prenom"
                  className="block text-sm font-semibold text-[#181818] mb-2"
                >
                  Prénom <span className="text-[#C2410C]">*</span>
                </label>
                <input
                  id="rsvp-prenom"
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => {
                    setPrenom(e.target.value);
                    if (errors.prenom) setErrors((prev) => ({ ...prev, prenom: undefined }));
                  }}
                  placeholder="Ex. : Romaric"
                  aria-invalid={Boolean(errors.prenom)}
                  aria-describedby={errors.prenom ? "rsvp-prenom-error" : undefined}
                  className={`w-full rounded-xl border px-4 py-3 text-base text-[#181818] bg-[#FFFAF5] placeholder:text-[#666666]/60 focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors ${
                    errors.prenom ? "border-red-600" : "border-[#EADFD5]"
                  }`}
                />
                {errors.prenom && (
                  <p
                    id="rsvp-prenom-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-red-700 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.prenom}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rsvp-nom"
                  className="block text-sm font-semibold text-[#181818] mb-2"
                >
                  Nom <span className="text-xs font-normal text-[#666666]">(facultatif)</span>
                </label>
                <input
                  id="rsvp-nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-base text-[#181818] bg-[#FFFAF5] placeholder:text-[#666666]/60 focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors"
                />
              </div>
            </div>

            {/* Présence : Oui / Non / Peut-être */}
            <fieldset>
              <legend className="block text-sm font-semibold text-[#181818] mb-2.5">
                Votre présence <span className="text-[#C2410C]">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["Oui", "Non", "Peut-être"] as const).map((choice) => {
                  const isSelected = presence === choice;
                  const choiceLabel =
                    choice === "Oui"
                      ? "Oui, avec plaisir"
                      : choice === "Non"
                      ? "Non, malheureusement"
                      : "Peut-être";
                  return (
                    <label
                      key={choice}
                      className={`cursor-pointer rounded-xl border px-4 py-3.5 flex items-center justify-center text-center text-sm font-semibold transition-all ${
                        isSelected
                          ? "bg-[#FFF1E6] border-[#F97316] text-[#C2410C] shadow-xs"
                          : "bg-[#FFFAF5] border-[#EADFD5] text-[#181818] hover:border-[#F97316]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rsvp-presence"
                        value={choice}
                        checked={isSelected}
                        onChange={() => setPresence(choice)}
                        className="sr-only"
                      />
                      <span>{choiceLabel}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Accompagnants (affiché si pertinent) */}
            {showCompanionsField && (
              <div className="space-y-5 pt-2 border-t border-[#EADFD5]">
                <div>
                  <label
                    htmlFor="rsvp-accompagnants"
                    className="block text-sm font-semibold text-[#181818] mb-2"
                  >
                    Nombre d’accompagnants (0 à {config.maxCompanions})
                  </label>
                  <select
                    id="rsvp-accompagnants"
                    value={accompagnants}
                    onChange={(e) => setAccompagnants(Number(e.target.value))}
                    className="w-full sm:w-64 rounded-xl border border-[#EADFD5] px-4 py-3 text-base text-[#181818] bg-[#FFFAF5] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    {companionOptions.map((num) => (
                      <option key={num} value={num}>
                        {num === 0
                          ? "0 (je viens seul·e)"
                          : num === 1
                          ? "1 accompagnant"
                          : `${num} accompagnants`}
                      </option>
                    ))}
                  </select>
                  {errors.accompagnants && (
                    <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                      {errors.accompagnants}
                    </p>
                  )}
                </div>

                {accompagnants > 0 && (
                  <div>
                    <label
                      htmlFor="rsvp-prenoms-accompagnants"
                      className="block text-sm font-semibold text-[#181818] mb-2"
                    >
                      Prénoms des accompagnants{" "}
                      <span className="text-xs font-normal text-[#666666]">(facultatif)</span>
                    </label>
                    <input
                      id="rsvp-prenoms-accompagnants"
                      type="text"
                      value={prenomsAccompagnants}
                      onChange={(e) => setPrenomsAccompagnants(e.target.value)}
                      placeholder="Ex. : Marie, Lucas..."
                      className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-base text-[#181818] bg-[#FFFAF5] placeholder:text-[#666666]/60 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Préférences ou restrictions alimentaires */}
            {presence !== "Non" && (
              <div>
                <label
                  htmlFor="rsvp-preferences"
                  className="block text-sm font-semibold text-[#181818] mb-2"
                >
                  Préférences ou restrictions alimentaires{" "}
                  <span className="text-xs font-normal text-[#666666]">(facultatif)</span>
                </label>
                <input
                  id="rsvp-preferences"
                  type="text"
                  value={preferencesAlimentaires}
                  onChange={(e) => setPreferencesAlimentaires(e.target.value)}
                  placeholder="Ex. : Végétarien, allergie aux fruits à coque, sans gluten..."
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-base text-[#181818] bg-[#FFFAF5] placeholder:text-[#666666]/60 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>
            )}

            {/* Message pour l’organisation */}
            <div>
              <label
                htmlFor="rsvp-message"
                className="block text-sm font-semibold text-[#181818] mb-2"
              >
                Message pour l’organisation{" "}
                <span className="text-xs font-normal text-[#666666]">(facultatif)</span>
              </label>
              <textarea
                id="rsvp-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Une précision sur votre heure d’arrivée ou un petit mot..."
                className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-base text-[#181818] bg-[#FFFAF5] placeholder:text-[#666666]/60 focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-y"
              />
            </div>

            {/* Bouton principal & texte explicatif */}
            <div className="pt-2">
              <button
                type="submit"
                className="btn-interactive group w-full inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-semibold text-white bg-[#F97316] hover:bg-[#C2410C] rounded-2xl shadow-[0_8px_24px_rgba(249,115,22,0.22)] hover:shadow-[0_14px_34px_rgba(249,115,22,0.38)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                <MessageCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6" />
                <span>Continuer sur WhatsApp</span>
              </button>

              <p className="mt-3 text-xs sm:text-sm text-[#666666] text-center">
                Votre réponse sera préparée dans WhatsApp. Appuyez sur Envoyer pour la transmettre
                à l’organisation ({config.whatsappDisplayNumber}).
              </p>
            </div>
          </form>

          {/* État après préparation du message + solution de secours */}
          {preparedState && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-2xl bg-[#FFF1E6] border border-[#F97316]/40 p-5 text-sm text-[#181818]"
            >
              <p className="font-semibold text-[#C2410C]">
                Votre message est prêt dans WhatsApp. Pensez à l’envoyer pour transmettre votre
                réponse.
              </p>
              <p className="mt-1 text-xs text-[#666666]">
                Si la fenêtre WhatsApp ne s’est pas ouverte automatiquement, utilisez le lien
                direct ci-dessous ou copiez votre message :
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={preparedState.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir WhatsApp ({config.whatsappDisplayNumber})</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFFAF5] border border-[#EADFD5] text-[#181818] text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedFallback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#C2410C]" />
                      <span>Message copié dans le presse-papiers</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Copier le message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boîte de dialogue festive de confirmation + Pluie de cadeaux & canvas-confetti pendant 3 secondes */}
      <AnimatePresence>
        {celebrationModal?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-celebration-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-hidden"
          >
            {/* Pluie d'émojis cadeaux du haut vers le bas sur tout l'écran */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 overflow-hidden z-0"
            >
              {giftParticles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ y: "-12vh", opacity: 0, rotate: 0, scale: 0.8 }}
                  animate={{
                    y: "112vh",
                    opacity: [0, 1, 1, 0.9, 0],
                    rotate: p.rotate * 3,
                    scale: [0.85, 1.1, 1],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: "linear",
                  }}
                  style={{
                    left: `${p.left}%`,
                    fontSize: `${p.size}px`,
                  }}
                  className="absolute -top-12 select-none drop-shadow-md"
                >
                  {p.emoji}
                </motion.div>
              ))}
            </div>

            {/* Boîte de dialogue centrale */}
            <motion.div
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 max-w-md w-full rounded-[28px] bg-[#181818] border border-[#F97316]/40 p-7 sm:p-9 text-center text-white shadow-[0_28px_80px_rgba(0,0,0,0.65)]"
            >
              <button
                type="button"
                onClick={() => {
                  const targetUrl = celebrationModal.whatsappUrl;
                  setCelebrationModal(null);
                  openWhatsAppUrl(targetUrl);
                }}
                aria-label="Fermer et ouvrir WhatsApp"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                <Sparkles className="w-8 h-8" />
              </div>

              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F97316] mb-2">
                Célébrons ensemble
              </p>

              <h3
                id="rsvp-celebration-title"
                className="font-poppins text-2xl sm:text-3xl font-bold text-white leading-snug"
              >
                Merci <span className="text-[#F97316]">{celebrationModal.guestName}</span> !
              </h3>

              <p className="mt-3 font-poppins text-base sm:text-lg font-medium text-[#FFF1E6]">
                Ta participation a été prise en compte.
              </p>

              <p className="mt-2 font-poppins text-xs sm:text-sm font-light text-white/75 leading-relaxed">
                Ouverture de WhatsApp dans un instant pour envoyer ton message de confirmation à
                l’organisation…
              </p>

              {/* Barre de progression fluide de 3 secondes */}
              <div className="mt-6 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-[#F97316] rounded-full"
                />
              </div>

              <div className="mt-6">
                <a
                  href={celebrationModal.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setCelebrationModal(null)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white text-sm font-semibold transition-colors shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ouvrir WhatsApp maintenant</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
