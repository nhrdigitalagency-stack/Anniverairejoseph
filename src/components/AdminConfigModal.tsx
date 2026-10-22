import React, { useState, useEffect, useRef } from "react";
import { X, Sliders, Copy, Check, RotateCcw, Plus, Trash2 } from "lucide-react";
import { EventConfig, eventConfig as defaultEventConfig } from "../config/eventConfig";
import { copyTextToClipboard } from "../utils/share";

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EventConfig;
  onUpdateConfig: (nextConfig: EventConfig) => void;
  onResetConfig: () => void;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetConfig,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = <K extends keyof EventConfig>(key: K, value: EventConfig[K]) => {
    onUpdateConfig({
      ...config,
      [key]: value,
    });
  };

  const handleScheduleChange = (
    index: number,
    field: "title" | "description" | "time",
    value: string
  ) => {
    const nextSchedule = config.schedule.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    );
    updateField("schedule", nextSchedule);
  };

  const handleGalleryAdd = () => {
    const nextId = `photo-${Date.now()}`;
    updateField("galleryImages", [
      ...config.galleryImages,
      {
        id: nextId,
        url: "",
        alt: `Souvenir de l’anniversaire de ${config.celebrantName}`,
        caption: "Nouveau souvenir",
        aspectRatio: "portrait",
      },
    ]);
  };

  const handleGalleryRemove = (id: string) => {
    updateField(
      "galleryImages",
      config.galleryImages.filter((img) => img.id !== id)
    );
  };

  const handleGalleryChange = (
    id: string,
    field: "url" | "alt" | "caption",
    value: string
  ) => {
    updateField(
      "galleryImages",
      config.galleryImages.map((img) => (img.id === id ? { ...img, [field]: value } : img))
    );
  };

  const generateTypeScriptConfigFile = (): string => {
    return `import { EventConfig } from "./eventConfig";\n\nexport const eventConfig: EventConfig = ${JSON.stringify(
      config,
      null,
      2
    )};\n`;
  };

  const handleCopyConfig = async () => {
    const code = generateTypeScriptConfigFile();
    const ok = await copyTextToClipboard(code);
    if (ok) {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 3500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFAF5] text-[#181818] border border-[#EADFD5] rounded-[28px] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="px-6 py-5 border-b border-[#EADFD5] flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] text-[#C2410C] flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="admin-modal-title"
                className="font-editorial text-2xl font-semibold text-[#181818]"
              >
                Personnalisation & Aperçu des contenus
              </h2>
              <p className="text-xs text-[#666666]">
                Testez vos informations en direct (date, lieu, horaires, photos) puis copiez la
                configuration pour <code className="text-[#C2410C]">src/config/eventConfig.ts</code>.
              </p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer le panneau de personnalisation"
            className="w-9 h-9 rounded-xl border border-[#EADFD5] flex items-center justify-center text-[#666666] hover:text-[#181818] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-sm">
          {/* 1. Date & Compte à rebours */}
          <div className="bg-white rounded-2xl border border-[#EADFD5] p-5 space-y-4">
            <h3 className="font-editorial text-xl font-semibold text-[#181818]">
              1. Date, heure et fuseau horaire
            </h3>
            <p className="text-xs text-[#666666]">
              Utilisez un format ISO avec décalage horaire explicite (ex.{" "}
              <code className="text-[#C2410C]">2026-11-21T19:30:00+01:00</code>). Laissez vide si
              la date n’est pas encore annoncée.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#181818] mb-1">
                  Début (ISO 8601)
                </label>
                <input
                  type="text"
                  value={config.eventStart || ""}
                  onChange={(e) =>
                    updateField("eventStart", e.target.value.trim() ? e.target.value : null)
                  }
                  placeholder="2026-11-21T19:30:00+01:00"
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#181818] mb-1">
                  Fin (ISO 8601, facultatif)
                </label>
                <input
                  type="text"
                  value={config.eventEnd || ""}
                  onChange={(e) =>
                    updateField("eventEnd", e.target.value.trim() ? e.target.value : null)
                  }
                  placeholder="2026-11-22T02:00:00+01:00"
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#181818] mb-1">
                  Fuseau horaire
                </label>
                <input
                  type="text"
                  value={config.timeZone || ""}
                  onChange={(e) =>
                    updateField("timeZone", e.target.value.trim() ? e.target.value : null)
                  }
                  placeholder="Europe/Paris"
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
              </div>
            </div>
          </div>

          {/* 2. Lieu & Informations pratiques */}
          <div className="bg-white rounded-2xl border border-[#EADFD5] p-5 space-y-4">
            <h3 className="font-editorial text-xl font-semibold text-[#181818]">
              2. Lieu, adresse et infos pratiques
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#181818] mb-1">
                  Nom du lieu
                </label>
                <input
                  type="text"
                  value={config.venueName}
                  onChange={(e) => updateField("venueName", e.target.value)}
                  placeholder="Lieu communiqué prochainement si vide"
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#181818] mb-1">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Adresse exacte"
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#181818] mb-1">
                  Lien Google Maps direct (facultatif)
                </label>
                <input
                  type="url"
                  value={config.mapsUrl}
                  onChange={(e) => updateField("mapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#181818] mb-1">
                  Dress code
                </label>
                <input
                  type="text"
                  value={config.dressCode}
                  onChange={(e) => updateField("dressCode", e.target.value)}
                  placeholder="Ex. : Chic & décontracté, touche d’orange..."
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#181818] mb-1">
                  Accès et stationnement
                </label>
                <input
                  type="text"
                  value={config.accessAndParking}
                  onChange={(e) => updateField("accessAndParking", e.target.value)}
                  placeholder="Métro, parking à proximité, code d’accès..."
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
              </div>
            </div>
          </div>

          {/* 3. Programme */}
          <div className="bg-white rounded-2xl border border-[#EADFD5] p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-editorial text-xl font-semibold text-[#181818]">
                3. Étapes du programme
              </h3>
              <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.scheduleConfirmed}
                  onChange={(e) => updateField("scheduleConfirmed", e.target.checked)}
                  className="rounded border-[#EADFD5] text-[#F97316] focus:ring-[#F97316]"
                />
                <span>Afficher les étapes du programme</span>
              </label>
            </div>

            <div className="space-y-3">
              {config.schedule.map((step, index) => (
                <div
                  key={step.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl bg-[#FFFAF5] border border-[#EADFD5]"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                      Horaire (facultatif)
                    </label>
                    <input
                      type="text"
                      value={step.time || ""}
                      onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
                      placeholder="Ex. : 19h30"
                      className="w-full rounded-lg border border-[#EADFD5] px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleScheduleChange(index, "title", e.target.value)}
                      className="w-full rounded-lg border border-[#EADFD5] px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => handleScheduleChange(index, "description", e.target.value)}
                      className="w-full rounded-lg border border-[#EADFD5] px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Options & Photos */}
          <div className="bg-white rounded-2xl border border-[#EADFD5] p-5 space-y-4">
            <h3 className="font-editorial text-xl font-semibold text-[#181818]">
              4. Options des formulaires & Photos
            </h3>
            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.allowCompanions}
                  onChange={(e) => updateField("allowCompanions", e.target.checked)}
                />
                <span>Autoriser les accompagnants</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showGiftSection}
                  onChange={(e) => updateField("showGiftSection", e.target.checked)}
                />
                <span>Afficher la section « Une attention ou une surprise ? »</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#181818] mb-1">
                Photo portrait principale (Hero) — laissez vide pour tester la version typographique
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.portraitUrl}
                  onChange={(e) => updateField("portraitUrl", e.target.value)}
                  placeholder="/assets/aistudio/..."
                  className="w-full rounded-xl border border-[#EADFD5] px-3 py-2 text-xs bg-[#FFFAF5]"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      "portraitUrl",
                      config.portraitUrl ? "" : defaultEventConfig.portraitUrl
                    )
                  }
                  className="px-3 py-2 rounded-xl border border-[#EADFD5] bg-[#FFF1E6] text-[#C2410C] text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  {config.portraitUrl ? "Tester sans photo" : "Restaurer portrait"}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#181818]">
                  Photos de la galerie ({config.galleryImages.length})
                </span>
                <button
                  type="button"
                  onClick={handleGalleryAdd}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFF1E6] text-[#C2410C] text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une photo</span>
                </button>
              </div>

              <div className="space-y-2">
                {config.galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#FFFAF5] border border-[#EADFD5]"
                  >
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => handleGalleryChange(img.id, "url", e.target.value)}
                      placeholder="Chemin ou URL de la photo"
                      className="sm:col-span-5 rounded-lg border border-[#EADFD5] px-2.5 py-1.5 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={img.caption || ""}
                      onChange={(e) => handleGalleryChange(img.id, "caption", e.target.value)}
                      placeholder="Légende"
                      className="sm:col-span-5 rounded-lg border border-[#EADFD5] px-2.5 py-1.5 text-xs bg-white"
                    />
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleGalleryRemove(img.id)}
                        aria-label="Retirer cette photo"
                        className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pied de modale : Copier le fichier eventConfig.ts ou réinitialiser */}
        <div className="px-6 py-4 border-t border-[#EADFD5] bg-white flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetConfig}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EADFD5] text-xs font-semibold text-[#666666] hover:text-[#181818] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les valeurs par défaut</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyConfig}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF1E6] border border-[#F97316]/40 text-[#C2410C] text-xs font-semibold cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Code eventConfig.ts copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier la configuration TypeScript</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white text-xs font-semibold cursor-pointer"
            >
              Appliquer à l’aperçu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
