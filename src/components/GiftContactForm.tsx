import React, { useState } from "react";
import { Gift, MessageCircle, Copy, Check, ExternalLink, AlertCircle } from "lucide-react";
import { EventConfig } from "../config/eventConfig";
import { buildWhatsAppUrl, formatGiftSurpriseMessage } from "../utils/whatsapp";
import { validateGiftInput, ValidationErrors } from "../utils/validation";
import { copyTextToClipboard } from "../utils/share";

interface GiftContactFormProps {
  config: EventConfig;
}

export const GiftContactForm: React.FC<GiftContactFormProps> = ({ config }) => {
  const [prenom, setPrenom] = useState("");
  const [objet, setObjet] = useState<"Cadeau" | "Surprise" | "Autre question">("Surprise");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [preparedState, setPreparedState] = useState<{
    whatsappUrl: string;
    rawMessage: string;
  } | null>(null);
  const [copiedFallback, setCopiedFallback] = useState(false);

  if (!config.showGiftSection) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateGiftInput({ prenom, objet, message });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const rawMessage = formatGiftSurpriseMessage(prenom, objet, message);
    const whatsappUrl = buildWhatsAppUrl(rawMessage, config.whatsappNumber);
    setPreparedState({ whatsappUrl, rawMessage });

    const anchor = document.createElement("a");
    anchor.href = whatsappUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleCopy = async () => {
    const text = preparedState?.rawMessage || formatGiftSurpriseMessage(prenom, objet, message);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedFallback(true);
      window.setTimeout(() => setCopiedFallback(false), 3500);
    }
  };

  return (
    <section aria-labelledby="gift-section-title" className="py-14 sm:py-20 border-b border-[#EADFD5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-[#FFF1E6]/55 border border-[#EADFD5] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Colonne texte explicatif */}
            <div className="lg:col-span-5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EADFD5] text-[#C2410C] flex items-center justify-center mb-5">
                <Gift className="w-5 h-5" />
              </div>

              <h2
                id="gift-section-title"
                className="font-editorial text-3xl sm:text-4xl font-semibold text-[#181818] tracking-tight"
              >
                Une attention ou une surprise ?
              </h2>

              <p className="mt-3 text-sm sm:text-base text-[#666666] leading-relaxed">
                Votre présence compte avant tout. Pour préparer une surprise ou poser une question
                à l’organisation, laissez simplement un message.
              </p>

              <p className="mt-4 text-xs text-[#666666]">
                Coordination directe sur WhatsApp au{" "}
                <span className="font-semibold text-[#181818] tabular-nums">
                  {config.whatsappDisplayNumber}
                </span>
                .
              </p>
            </div>

            {/* Petit formulaire discret */}
            <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#EADFD5] p-6 sm:p-7 shadow-xs">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="gift-prenom"
                      className="block text-sm font-semibold text-[#181818] mb-1.5"
                    >
                      Votre prénom <span className="text-[#C2410C]">*</span>
                    </label>
                    <input
                      id="gift-prenom"
                      type="text"
                      required
                      value={prenom}
                      onChange={(e) => {
                        setPrenom(e.target.value);
                        if (errors.prenom) setErrors((prev) => ({ ...prev, prenom: undefined }));
                      }}
                      placeholder="Votre prénom"
                      aria-invalid={Boolean(errors.prenom)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#181818] bg-[#FFFAF5] focus:outline-none focus:ring-2 focus:ring-[#F97316] ${
                        errors.prenom ? "border-red-600" : "border-[#EADFD5]"
                      }`}
                    />
                    {errors.prenom && (
                      <p role="alert" className="mt-1 text-xs text-red-700 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.prenom}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="gift-objet"
                      className="block text-sm font-semibold text-[#181818] mb-1.5"
                    >
                      Objet <span className="text-[#C2410C]">*</span>
                    </label>
                    <select
                      id="gift-objet"
                      value={objet}
                      onChange={(e) =>
                        setObjet(e.target.value as "Cadeau" | "Surprise" | "Autre question")
                      }
                      className="w-full rounded-xl border border-[#EADFD5] px-3.5 py-2.5 text-sm text-[#181818] bg-[#FFFAF5] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    >
                      <option value="Surprise">Surprise</option>
                      <option value="Cadeau">Cadeau</option>
                      <option value="Autre question">Autre question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="gift-message"
                    className="block text-sm font-semibold text-[#181818] mb-1.5"
                  >
                    Votre message <span className="text-[#C2410C]">*</span>
                  </label>
                  <textarea
                    id="gift-message"
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                    }}
                    placeholder="Décrivez votre idée de surprise, de cadeau groupé ou votre question..."
                    aria-invalid={Boolean(errors.message)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#181818] bg-[#FFFAF5] focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-y ${
                      errors.message ? "border-red-600" : "border-[#EADFD5]"
                    }`}
                  />
                  {errors.message && (
                    <p role="alert" className="mt-1 text-xs text-red-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-interactive group w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-[#181818] hover:bg-[#C2410C] rounded-xl shadow-xs hover:shadow-[0_10px_28px_rgba(194,65,12,0.3)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
                >
                  <MessageCircle className="w-4 h-4 text-[#F97316] group-hover:text-white transition-all duration-200 group-hover:scale-110" />
                  <span>Contacter l’organisation sur WhatsApp</span>
                </button>
              </form>

              {preparedState && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-4 rounded-xl bg-[#FFF1E6] border border-[#F97316]/40 p-4 text-xs text-[#181818]"
                >
                  <p className="font-semibold text-[#C2410C]">
                    Votre message est prêt dans WhatsApp. Pensez à appuyer sur « Envoyer ».
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                    <a
                      href={preparedState.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316] text-white font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ouvrir WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#EADFD5] text-[#181818] font-semibold cursor-pointer"
                    >
                      {copiedFallback ? (
                        <>
                          <Check className="w-3 h-3 text-[#C2410C]" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#F97316]" />
                          <span>Copier le message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
