import React, { useState } from "react";
import { Send, Copy, Check, ExternalLink, AlertCircle, Lock } from "lucide-react";
import { EventConfig } from "../config/eventConfig";
import { buildWhatsAppUrl, formatBirthdayWishMessage } from "../utils/whatsapp";
import { validateBirthdayWishInput, ValidationErrors } from "../utils/validation";
import { copyTextToClipboard } from "../utils/share";

interface BirthdayMessageFormProps {
  config: EventConfig;
}

const MAX_MESSAGE_LENGTH = 1000;

export const BirthdayMessageForm: React.FC<BirthdayMessageFormProps> = ({ config }) => {
  const [prenom, setPrenom] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [preparedState, setPreparedState] = useState<{
    whatsappUrl: string;
    rawMessage: string;
  } | null>(null);
  const [copiedFallback, setCopiedFallback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBirthdayWishInput({ prenom, message });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const rawMessage = formatBirthdayWishMessage(prenom, message);
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
    const text = preparedState?.rawMessage || formatBirthdayWishMessage(prenom, message);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedFallback(true);
      window.setTimeout(() => setCopiedFallback(false), 3500);
    }
  };

  return (
    <section id="messages" className="py-16 sm:py-24 border-b border-[#EADFD5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#C2410C]">
            Vœux et intentions
          </p>
          <h2 className="mt-2 font-editorial text-3xl sm:text-5xl font-semibold text-[#181818] tracking-tight text-balance">
            Un mot pour {config.celebrantName}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#666666] leading-relaxed">
            Que vous soyez présent(e) ou à distance, laissez un message personnel pour souhaiter un
            joyeux anniversaire à {config.celebrantName}.
          </p>
        </div>

        <div className="mt-10 rounded-[28px] bg-white border border-[#EADFD5] p-6 sm:p-10 shadow-[0_12px_36px_rgba(24,24,24,0.04)]">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label
                htmlFor="wish-prenom"
                className="block text-sm font-semibold text-[#181818] mb-2"
              >
                Votre prénom <span className="text-[#C2410C]">*</span>
              </label>
              <input
                id="wish-prenom"
                type="text"
                required
                value={prenom}
                onChange={(e) => {
                  setPrenom(e.target.value);
                  if (errors.prenom) setErrors((prev) => ({ ...prev, prenom: undefined }));
                }}
                placeholder="Ex. : Thomas"
                aria-invalid={Boolean(errors.prenom)}
                aria-describedby={errors.prenom ? "wish-prenom-error" : undefined}
                className={`w-full rounded-xl border px-4 py-3 text-base text-[#181818] bg-[#FFFAF5] placeholder:text-[#666666]/60 focus:outline-none focus:ring-2 focus:ring-[#F97316] ${
                  errors.prenom ? "border-red-600" : "border-[#EADFD5]"
                }`}
              />
              {errors.prenom && (
                <p
                  id="wish-prenom-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-red-700 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.prenom}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label
                  htmlFor="wish-message"
                  className="block text-sm font-semibold text-[#181818]"
                >
                  Votre message <span className="text-[#C2410C]">*</span>
                </label>
                <span
                  aria-live="polite"
                  className={`text-xs tabular-nums ${
                    message.length > MAX_MESSAGE_LENGTH ? "text-red-700 font-semibold" : "text-[#666666]"
                  }`}
                >
                  {message.length} / {MAX_MESSAGE_LENGTH}
                </span>
              </div>
              <textarea
                id="wish-message"
                rows={4}
                maxLength={MAX_MESSAGE_LENGTH}
                required
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                }}
                placeholder={`Écrivez vos vœux d’anniversaire pour ${config.celebrantName}...`}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "wish-message-error" : undefined}
                className={`w-full rounded-xl border px-4 py-3 text-base text-[#181818] bg-[#FFFAF5] placeholder:text-[#666666]/60 focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-y ${
                  errors.message ? "border-red-600" : "border-[#EADFD5]"
                }`}
              />
              {errors.message && (
                <p
                  id="wish-message-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-red-700 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#666666] bg-[#FFFAF5] border border-[#EADFD5] rounded-xl p-3.5">
              <Lock className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
              <p>
                Ce message est envoyé en privé via WhatsApp et n’est pas publié sur le site.
              </p>
            </div>

            <button
              type="submit"
              className="btn-interactive group w-full inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-semibold text-white bg-[#F97316] hover:bg-[#C2410C] rounded-2xl shadow-[0_8px_24px_rgba(249,115,22,0.2)] hover:shadow-[0_14px_34px_rgba(249,115,22,0.36)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
            >
              <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              <span>Préparer mon message sur WhatsApp</span>
            </button>
          </form>

          {preparedState && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-2xl bg-[#FFF1E6] border border-[#F97316]/40 p-5 text-sm text-[#181818]"
            >
              <p className="font-semibold text-[#C2410C]">
                Votre message est prêt dans WhatsApp. Appuyez sur « Envoyer » dans l’application
                pour le transmettre.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-3">
                <a
                  href={preparedState.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir dans WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FFFAF5] border border-[#EADFD5] text-[#181818] text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedFallback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#C2410C]" />
                      <span>Message copié</span>
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
    </section>
  );
};
