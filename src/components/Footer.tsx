import React, { useState, useEffect, useRef } from "react";
import { Share2, MessageCircle, Check, Copy, ShieldCheck, X } from "lucide-react";
import { EventConfig } from "../config/eventConfig";
import { buildWhatsAppUrl, getGeneralContactMessage } from "../utils/whatsapp";
import { shareInvitation, copyTextToClipboard } from "../utils/share";

interface FooterProps {
  config: EventConfig;
  onOpenAdminModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenAdminModal }) => {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [fallbackUrlToCopy, setFallbackUrlToCopy] = useState<string | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const closePrivacyBtnRef = useRef<HTMLButtonElement | null>(null);

  const contactWhatsAppUrl = buildWhatsAppUrl(
    getGeneralContactMessage(),
    config.whatsappNumber
  );

  const handleShare = async () => {
    const result = await shareInvitation(config.celebrantName, config.siteUrl);
    if (result.status === "shared") {
      setShareFeedback("Invitation partagée");
      window.setTimeout(() => setShareFeedback(null), 3500);
    } else if (result.status === "copied") {
      setShareFeedback("Lien de l’invitation copié dans le presse-papiers");
      setFallbackUrlToCopy(null);
      window.setTimeout(() => setShareFeedback(null), 4000);
    } else {
      setFallbackUrlToCopy(result.url);
    }
  };

  useEffect(() => {
    if (!privacyOpen) return;
    closePrivacyBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPrivacyOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [privacyOpen]);

  return (
    <footer className="bg-[#181818] text-[#FFFAF5] pt-16 pb-24 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bandeau de partage et de contact */}
        <div className="rounded-[28px] bg-[#222222] border border-white/10 p-7 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wider text-[#F97316]">
              Contact & Partage
            </p>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-semibold text-[#FFFAF5]">
              Une question ou envie de partager l’invitation ?
            </h2>
            <p className="mt-2 text-sm text-[#FFFAF5]/75 leading-relaxed">
              Contactez directement l’organisation sur WhatsApp au{" "}
              <span className="text-[#FFFAF5] font-semibold tabular-nums">
                {config.whatsappDisplayNumber}
              </span>{" "}
              ou transmettez le lien de cette page aux invités concernés.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto shrink-0">
            <a
              href={contactWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-interactive group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white text-sm font-semibold shadow-[0_8px_24px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_32px_rgba(249,115,22,0.4)] whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6" />
              <span>Contacter sur WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleShare}
              className="btn-interactive group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#F97316]/60 text-[#FFFAF5] text-sm font-semibold cursor-pointer whitespace-nowrap"
            >
              {shareFeedback ? (
                <>
                  <Check className="w-4 h-4 text-[#F97316]" />
                  <span>{shareFeedback}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#F97316] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                  <span>Partager l’invitation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Solution de repli si la copie automatique échoue */}
        {fallbackUrlToCopy && (
          <div className="mt-4 rounded-2xl bg-[#262626] border border-[#F97316]/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#FFFAF5]/85">
              Copiez manuellement le lien de l’invitation :
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                readOnly
                value={fallbackUrlToCopy}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Lien de l’invitation"
                className="w-full sm:w-80 px-3 py-2 rounded-lg bg-[#181818] border border-white/20 text-[#FFFAF5] text-xs"
              />
              <button
                type="button"
                onClick={async () => {
                  const ok = await copyTextToClipboard(fallbackUrlToCopy);
                  if (ok) {
                    setShareFeedback("Lien copié");
                    setFallbackUrlToCopy(null);
                  }
                }}
                className="px-3 py-2 rounded-lg bg-[#F97316] text-white font-semibold shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Bas de page éditorial */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <a
              href="#accueil"
              className="font-editorial text-3xl font-bold tracking-tight text-[#FFFAF5]"
            >
              {config.celebrantName}
              <span className="text-[#F97316]">.</span>
            </a>
            <p className="mt-1.5 text-sm text-[#FFFAF5]/70">
              Au plaisir de vous retrouver très bientôt pour célébrer ensemble.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#FFFAF5]/70">
            <a href="#accueil" className="hover:text-[#FFFAF5] transition-colors">
              Accueil
            </a>
            <a href="#programme" className="hover:text-[#FFFAF5] transition-colors">
              Programme
            </a>
            <a href="#infos" className="hover:text-[#FFFAF5] transition-colors">
              Infos pratiques
            </a>
            <a href="#confirmation" className="hover:text-[#FFFAF5] transition-colors">
              Confirmation
            </a>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-[#F97316] underline underline-offset-4 transition-colors cursor-pointer"
            >
              Notice de confidentialité
            </button>
            {onOpenAdminModal && (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="hover:text-[#F97316] transition-colors cursor-pointer"
              >
                Personnaliser l’invitation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modale Notice de confidentialité */}
      {privacyOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPrivacyOpen(false)}
        >
          <div
            className="bg-[#FFFAF5] text-[#181818] border border-[#EADFD5] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] text-[#C2410C] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3
                  id="privacy-modal-title"
                  className="font-editorial text-2xl font-semibold text-[#181818]"
                >
                  Notice de confidentialité
                </h3>
              </div>
              <button
                ref={closePrivacyBtnRef}
                type="button"
                onClick={() => setPrivacyOpen(false)}
                aria-label="Fermer la notice de confidentialité"
                className="w-9 h-9 rounded-xl border border-[#EADFD5] flex items-center justify-center text-[#666666] hover:text-[#181818] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
              <p>
                Cette page est une invitation privée dédiée à l’anniversaire de{" "}
                <strong className="text-[#181818]">{config.celebrantName}</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#181818]/90">
                <li>
                  Les champs renseignés dans les formulaires servent uniquement à préparer votre
                  message sur votre appareil.
                </li>
                <li>
                  Le message est transmis via WhatsApp uniquement lorsque vous appuyez vous-même
                  sur « Envoyer » dans l’application WhatsApp.
                </li>
                <li>
                  Ce site ne conserve aucune base de données serveur, ne stocke pas vos réponses
                  par défaut dans votre navigateur et n’utilise aucun outil de suivi publicitaire.
                </li>
                <li>
                  Une fois envoyées dans WhatsApp, les données transmises relèvent des conditions
                  d’utilisation et de confidentialité de ce service.
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EADFD5] flex justify-end">
              <button
                type="button"
                onClick={() => setPrivacyOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#181818] text-white text-sm font-semibold hover:bg-[#C2410C] transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
