import React from "react";
import { Users, Wine, Camera } from "lucide-react";

interface CelebrationIntroProps {
  celebrantName: string;
}

export const CelebrationIntro: React.FC<CelebrationIntroProps> = ({ celebrantName }) => {
  const pillars = [
    {
      title: "Se retrouver",
      description:
        "Prendre le temps d’échanger, de rire et de profiter d’une parenthèse chaleureuse entouré de visages familiers.",
      icon: Users,
    },
    {
      title: "Célébrer",
      description:
        "Lever nos verres à cette nouvelle année, partager un repas convivial et savourer l’instant présent en musique.",
      icon: Wine,
    },
    {
      title: "Créer des souvenirs",
      description:
        "Immortaliser ces retrouvailles et repartir avec des moments précieux qui resteront longtemps gravés.",
      icon: Camera,
    },
  ];

  return (
    <section
      id="celebration"
      className="relative py-20 sm:py-28 border-t border-[#EADFD5] overflow-hidden bg-[#FFFAF5]"
    >
      {/* Portrait de Joseph en arrière-plan à opacité diminuée (clair, lumineux et pas trop foncé) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src="/assets/aistudio/bfd85defb1b8c316733daf6a4f9dc73f_b97bbccb.jpg"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[center_22%] opacity-[0.16] sm:opacity-[0.18] scale-105"
        />
        {/* Voile ivoire doux et lumineux pour garantir une lisibilité parfaite sans assombrir */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFAF5]/90 via-[#FFFAF5]/65 to-[#FFFAF5]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFAF5]/85 via-transparent to-[#FFFAF5]/85" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mot personnel à la première personne */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#C2410C]">
            Un moment à partager
          </p>

          <blockquote className="mt-6">
            <p className="font-editorial text-2xl sm:text-4xl lg:text-[2.6rem] font-normal italic text-[#181818] leading-[1.35] text-balance">
              « Pour mon anniversaire, j’ai surtout envie de réunir les personnes qui comptent.
              Votre présence sera le plus beau cadeau : venez partager un moment simple, joyeux et
              mémorable avec moi. »
            </p>
            <footer className="mt-6 flex items-center justify-center gap-3">
              <span aria-hidden="true" className="w-8 h-[1px] bg-[#F97316]" />
              <cite className="not-italic font-editorial text-2xl font-semibold text-[#181818]">
                {celebrantName}
                <span className="text-[#F97316]">.</span>
              </cite>
              <span aria-hidden="true" className="w-8 h-[1px] bg-[#F97316]" />
            </footer>
          </blockquote>
        </div>

        {/* Trois cartes : Se retrouver, Célébrer, Créer des souvenirs */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-[24px] bg-white/90 backdrop-blur-md border border-[#EADFD5] p-7 sm:p-8 shadow-[0_12px_36px_rgba(24,24,24,0.04)] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF1E6] text-[#C2410C] flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="font-editorial text-lg italic text-[#666666] tabular-nums">
                      0{index + 1}.
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181818]">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-[#666666] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
