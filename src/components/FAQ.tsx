import React, { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { EventConfig } from "../config/eventConfig";
import {
  buildWhatsAppUrl,
  getGeneralContactMessage,
  getModificationContactMessage,
} from "../utils/whatsapp";

interface FAQProps {
  config: EventConfig;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  actionLabel?: string;
  actionHref?: string;
  isExternal?: boolean;
}

export const FAQ: React.FC<FAQProps> = ({ config }) => {
  const [openId, setOpenId] = useState<string | null>("faq-confirm");

  const hasVenueInfo = Boolean(config.venueName.trim() || config.address.trim());
  const hasDressCode = Boolean(config.dressCode.trim());

  const modificationWhatsAppUrl = buildWhatsAppUrl(
    getModificationContactMessage(),
    config.whatsappNumber
  );
  const contactWhatsAppUrl = buildWhatsAppUrl(
    getGeneralContactMessage(),
    config.whatsappNumber
  );

  const faqItems: FAQItem[] = [
    {
      id: "faq-confirm",
      question: "Comment confirmer ma présence ?",
      answer:
        "Il vous suffit de remplir le formulaire de confirmation sur cette page et de cliquer sur « Continuer sur WhatsApp ». Votre réponse sera automatiquement mise en forme : il ne vous restera plus qu’à appuyer sur « Envoyer » dans votre application WhatsApp.",
      actionLabel: "Aller au formulaire de confirmation",
      actionHref: "#confirmation",
    },
    {
      id: "faq-companions",
      question: "Puis-je venir accompagné ?",
      answer: config.allowCompanions
        ? `Vous pouvez indiquer jusqu’à ${config.maxCompanions} accompagnant${
            config.maxCompanions > 1 ? "s" : ""
          } directement dans le formulaire de confirmation, ainsi que leurs prénoms afin de faciliter l’organisation.`
        : "Pour toute demande concernant un accompagnant, merci de contacter directement l’organisation sur WhatsApp.",
    },
    {
      id: "faq-venue",
      question: "Où se déroule la fête ?",
      answer: hasVenueInfo
        ? `La célébration aura lieu à : ${[config.venueName.trim(), config.address.trim()]
            .filter(Boolean)
            .join(" — ")}. Vous trouverez les détails d’accès dans la section Informations pratiques.`
        : "Le lieu exact de la fête sera communiqué prochainement. Dès qu’il sera confirmé, l’adresse et le bouton d’itinéraire apparaîtront dans la section Informations pratiques.",
      actionLabel: "Voir les informations pratiques",
      actionHref: "#infos",
    },
    {
      id: "faq-dresscode",
      question: "Y a-t-il une tenue particulière ?",
      answer: hasDressCode
        ? `La tenue indiquée pour la soirée est : ${config.dressCode.trim()}.`
        : "Aucune consigne vestimentaire n’a encore été fixée. Si un dress code particulier est retenu, il sera précisé dans la section Informations pratiques.",
    },
    {
      id: "faq-change",
      question: "Comment prévenir d’un changement ?",
      answer:
        "Si votre disponibilité ou le nombre d’accompagnants évolue après votre premier message, vous pouvez envoyer un nouveau message WhatsApp à l’organisation en précisant qu’il s’agit d’une mise à jour de votre réponse.",
      actionLabel: "Préparer un message de modification sur WhatsApp",
      actionHref: modificationWhatsAppUrl,
      isExternal: true,
    },
    {
      id: "faq-contact",
      question: "Comment contacter l’organisation ?",
      answer: `L’organisation est joignable directement sur WhatsApp au ${config.whatsappDisplayNumber} pour toute question pratique ou idée de surprise.`,
      actionLabel: `Écrire sur WhatsApp (${config.whatsappDisplayNumber})`,
      actionHref: contactWhatsAppUrl,
      isExternal: true,
    },
  ];

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 border-b border-[#EADFD5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#C2410C]">
            Questions fréquentes
          </p>
          <h2 className="mt-2 font-editorial text-3xl sm:text-5xl font-semibold text-[#181818] tracking-tight text-balance">
            Réponses à vos questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#666666] leading-relaxed">
            Tout ce qu’il faut savoir pour préparer votre venue à l’anniversaire de{" "}
            {config.celebrantName}.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `${item.id}-panel`;
            const buttonId = `${item.id}-button`;

            return (
              <div
                key={item.id}
                className="rounded-[24px] bg-white border border-[#EADFD5] overflow-hidden transition-colors"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 sm:px-8 sm:py-6 text-left cursor-pointer hover:bg-[#FFF1E6]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#F97316]"
                  >
                    <span className="font-editorial text-xl sm:text-2xl font-semibold text-[#181818]">
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? "bg-[#F97316] text-white rotate-180"
                          : "bg-[#FFF1E6] text-[#C2410C]"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-6 pb-6 sm:px-8 sm:pb-7 pt-1 text-sm sm:text-base text-[#666666] leading-relaxed border-t border-[#EADFD5]/60"
                  >
                    <p>{item.answer}</p>

                    {item.actionLabel && item.actionHref && (
                      <div className="mt-4">
                        <a
                          href={item.actionHref}
                          target={item.isExternal ? "_blank" : undefined}
                          rel={item.isExternal ? "noopener noreferrer" : undefined}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C2410C] hover:text-[#F97316] transition-colors"
                        >
                          {item.isExternal && <MessageCircle className="w-4 h-4" />}
                          <span>{item.actionLabel}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
