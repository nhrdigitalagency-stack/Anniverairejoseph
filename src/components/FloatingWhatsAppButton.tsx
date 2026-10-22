import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, getGeneralContactMessage } from "../utils/whatsapp";

interface FloatingWhatsAppButtonProps {
  whatsappNumber: string;
  whatsappDisplayNumber: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  whatsappNumber,
  whatsappDisplayNumber,
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        setInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      setInputFocused(false);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const contactUrl = buildWhatsAppUrl(getGeneralContactMessage(), whatsappNumber);

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 transition-opacity duration-200 ${
        inputFocused ? "opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto" : "opacity-100"
      }`}
    >
      <a
        href={contactUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Contacter l’organisation sur WhatsApp au ${whatsappDisplayNumber}`}
        title={`WhatsApp organisation : ${whatsappDisplayNumber}`}
        className="inline-flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#181818] hover:bg-[#C2410C] text-[#FFFAF5] border border-white/15 shadow-[0_10px_28px_rgba(24,24,24,0.22)] transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
      >
        <MessageCircle className="w-5 h-5 text-[#F97316]" />
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
          Question ? WhatsApp
        </span>
      </a>
    </div>
  );
};
