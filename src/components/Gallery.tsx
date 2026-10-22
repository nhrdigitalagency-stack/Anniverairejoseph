import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Maximize2,
  MessageCircle,
  Upload,
  Plus,
  Share2,
  Trash2,
  User,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EventConfig, GalleryImage } from "../config/eventConfig";
import { buildWhatsAppUrl } from "../utils/whatsapp";

interface GalleryProps {
  config: EventConfig;
}

interface GuestUploadedPhoto extends GalleryImage {
  guestName: string;
  file?: File;
  isGuestUpload: true;
}

const GUEST_STORAGE_KEY = "joseph_birthday_guest_photos_v1";

/**
 * Redimensionne et compresse une image côté navigateur en Data URL JPEG
 * afin de permettre un aperçu fluide dans l’album de la soirée.
 */
function compressImageFile(file: File, maxDimension = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format d’image non reconnu."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const Gallery: React.FC<GalleryProps> = ({ config }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const [guestPhotos, setGuestPhotos] = useState<GuestUploadedPhoto[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(GUEST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignorer si localStorage est indisponible
    }
    return [];
  });

  // États de la modale d'ajout de photos par les invités
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sauvegarder les photos ajoutées localement pour que l'invité les retrouve dans sa galerie
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const serializable = guestPhotos.map(({ file: _f, ...rest }) => rest);
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignorer si quota dépassé
    }
  }, [guestPhotos]);

  const officialImages: GalleryImage[] = (config.galleryImages || []).filter(
    (img) => img && img.url && img.url.trim().length > 0 && !failedIds[img.id]
  );

  const allImages: (GalleryImage & { guestName?: string; isGuestUpload?: boolean })[] = [
    ...guestPhotos.filter((img) => !failedIds[img.id]),
    ...officialImages,
  ];

  const hasPhotos = allImages.length > 0;

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || allImages.length === 0) return null;
      return (prev - 1 + allImages.length) % allImages.length;
    });
  }, [allImages.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || allImages.length === 0) return null;
      return (prev + 1) % allImages.length;
    });
  }, [allImages.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        showPrev();
      } else if (e.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, closeLightbox, showPrev, showNext]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validImageFiles = files.filter((f) => f.type.startsWith("image/")).slice(0, 6);
    if (validImageFiles.length === 0) {
      setUploadError("Veuillez sélectionner un ou plusieurs fichiers image (JPG, PNG, WEBP).");
      return;
    }

    setUploadError(null);
    setSelectedFiles(validImageFiles);

    try {
      const compressedList = await Promise.all(
        validImageFiles.map((file) => compressImageFile(file, 1280, 0.82))
      );
      setPreviews(compressedList);
    } catch {
      setUploadError("Impossible de charger l’aperçu de certaines photos.");
    }
  };

  const handleAddPhotosToGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setUploadError("Veuillez indiquer votre prénom pour signer vos photos.");
      return;
    }
    if (previews.length === 0) {
      setUploadError("Veuillez sélectionner au moins une photo prise lors de l’anniversaire.");
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    const cleanName = guestName.trim();
    const cleanCaption =
      photoCaption.trim() || `Souvenir partagé par ${cleanName}`;

    const newEntries: GuestUploadedPhoto[] = previews.map((dataUrl, idx) => ({
      id: `guest-photo-${Date.now()}-${idx}`,
      url: dataUrl,
      alt: `${cleanCaption} (par ${cleanName})`,
      caption: cleanCaption,
      guestName: cleanName,
      file: selectedFiles[idx],
      isGuestUpload: true,
      aspectRatio: "portrait",
    }));

    setGuestPhotos((prev) => [...newEntries, ...prev]);
    setIsProcessing(false);
    setUploadSuccess(true);
  };

  const handleSendPhotosViaWhatsApp = async () => {
    const cleanName = guestName.trim() || "Un invité";
    const count = selectedFiles.length || 1;
    const captionNote = photoCaption.trim() ? `\nLégende : ${photoCaption.trim()}` : "";

    // Si le navigateur mobile supporte le partage natif de fichiers (Web Share API Level 2),
    // permettre d'envoyer directement les fichiers photos vers WhatsApp
    if (
      selectedFiles.length > 0 &&
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: selectedFiles })
    ) {
      try {
        await navigator.share({
          files: selectedFiles,
          title: `Photos souvenir — Anniversaire de ${config.celebrantName}`,
          text: `Voici ${count > 1 ? `${count} photos prises` : "une photo prise"} pour l’anniversaire de ${config.celebrantName} (de la part de ${cleanName}).${captionNote}`,
        });
        return;
      } catch {
        // Continuer vers le lien WhatsApp classique si l'utilisateur annule ou préfère wa.me
      }
    }

    const whatsappMessage = [
      `Bonjour, voici ${count > 1 ? `${count} photos prises` : "une photo prise"} lors de l’anniversaire de ${config.celebrantName} !`,
      "",
      `De la part de : ${cleanName}${captionNote}`,
      "",
      "(Je joins les photos directement dans cette conversation WhatsApp 📸)",
    ].join("\n");

    const url = buildWhatsAppUrl(whatsappMessage, config.whatsappNumber);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const resetUploadModal = () => {
    setUploadModalOpen(false);
    setUploadSuccess(false);
    setSelectedFiles([]);
    setPreviews([]);
    setPhotoCaption("");
    setUploadError(null);
  };

  const handleDeleteGuestPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGuestPhotos((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section id="galerie" className="py-16 sm:py-24 border-b border-[#EADFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#C2410C]">
              Regards et instants
            </p>
            <h2 className="mt-2 font-editorial text-3xl sm:text-5xl font-semibold text-[#181818] tracking-tight text-balance">
              Galerie & Souvenirs de la fête
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#666666] leading-relaxed">
              Découvrez les portraits de {config.celebrantName} et ajoutez vos propres photos
              prises le jour de l’anniversaire pour enrichir l’album de la soirée.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setUploadSuccess(false);
                setUploadModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#F97316] hover:bg-[#C2410C] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(249,115,22,0.25)] hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <Camera className="w-4 h-4" />
              <span>Ajouter mes photos de la soirée</span>
            </button>
          </div>
        </div>

        {/* Bandeau d'invitation à partager les photos prises le jour J */}
        <div className="mt-8 rounded-[24px] bg-[#FFF1E6]/70 border border-[#EADFD5] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#EADFD5] text-[#F97316] flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[#181818]">
                Vous avez pris de belles photos pendant la fête ?
              </h3>
              <p className="text-xs sm:text-sm text-[#666666]">
                Ajoutez-les directement dans cet album souvenir et transmettez-les à{" "}
                {config.celebrantName} en un clic.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setUploadSuccess(false);
              setUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFFAF5] border border-[#EADFD5] hover:border-[#F97316] text-xs sm:text-sm font-semibold text-[#C2410C] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Sélectionner des photos</span>
          </button>
        </div>

        {!hasPhotos ? (
          <div className="mt-12 rounded-[28px] bg-gradient-to-br from-[#FFF1E6] via-[#FFFAF5] to-[#FFE4CC] border border-[#EADFD5] p-10 sm:p-16 text-center max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#EADFD5] text-[#F97316] flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <p className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181818]">
              Les beaux souvenirs trouveront bientôt leur place ici.
            </p>
            <p className="mt-2 text-sm text-[#666666] max-w-md mx-auto">
              Soyez le premier invité à ajouter une photo prise lors de l’anniversaire de{" "}
              {config.celebrantName}.
            </p>
          </div>
        ) : (
          /* Grille éditoriale responsive */
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allImages.map((image, idx) => (
              <figure
                key={image.id}
                className="group relative rounded-[24px] overflow-hidden bg-[#FFF1E6] border border-[#EADFD5] shadow-[0_10px_30px_rgba(24,24,24,0.05)] aspect-[3/4]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  aria-label={`Agrandir la photo : ${image.alt}`}
                  className="w-full h-full block text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    loading={idx < 2 ? "eager" : "lazy"}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedIds((prev) => ({
                        ...prev,
                        [image.id]: true,
                      }))
                    }
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Scrim discret au survol */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-85 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-5">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-medium text-[#F97316] tracking-wider">
                          {image.isGuestUpload && image.guestName
                            ? `Photo de ${image.guestName}`
                            : `0${idx + 1}`}
                        </span>
                        {image.caption && (
                          <figcaption className="font-editorial text-xl font-semibold text-[#FFFAF5] leading-snug line-clamp-2">
                            {image.caption}
                          </figcaption>
                        )}
                      </div>
                      <span
                        aria-hidden="true"
                        className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs text-white flex items-center justify-center shrink-0 group-hover:bg-[#F97316] transition-colors"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </button>

                {/* Bouton de retrait si c'est une photo ajoutée par l'invité sur son appareil */}
                {image.isGuestUpload && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteGuestPhoto(image.id, e)}
                    aria-label="Retirer cette photo de mon aperçu"
                    title="Retirer cette photo"
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/55 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* Modale d’ajout de photos par les invités le jour de l'anniversaire */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-upload-modal-title"
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={resetUploadModal}
          >
            <motion.div
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 10, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFAF5] text-[#181818] border border-[#EADFD5] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl my-auto"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF1E6] text-[#F97316] flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      id="guest-upload-modal-title"
                      className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181818]"
                    >
                      Partager mes photos de la fête
                    </h3>
                    <p className="text-xs text-[#666666]">
                      Immortalisez les meilleurs moments de l’anniversaire de{" "}
                      {config.celebrantName}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetUploadModal}
                  aria-label="Fermer la fenêtre d’ajout de photos"
                  className="w-9 h-9 rounded-xl border border-[#EADFD5] flex items-center justify-center text-[#666666] hover:text-[#181818] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!uploadSuccess ? (
                <form onSubmit={handleAddPhotosToGallery} className="space-y-5">
                  <div>
                    <label
                      htmlFor="guest-photo-name"
                      className="block text-sm font-semibold text-[#181818] mb-1.5"
                    >
                      Votre prénom <span className="text-[#C2410C]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="guest-photo-name"
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Ex. : Romaric"
                        className="w-full rounded-xl border border-[#EADFD5] pl-10 pr-4 py-2.5 text-sm text-[#181818] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="guest-photo-caption"
                      className="block text-sm font-semibold text-[#181818] mb-1.5"
                    >
                      Petite légende ou moment{" "}
                      <span className="text-xs font-normal text-[#666666]">(facultatif)</span>
                    </label>
                    <input
                      id="guest-photo-caption"
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="Ex. : Le moment du gâteau, piste de danse..."
                      className="w-full rounded-xl border border-[#EADFD5] px-4 py-2.5 text-sm text-[#181818] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>

                  {/* Sélecteur de fichiers / appareil photo mobile */}
                  <div>
                    <span className="block text-sm font-semibold text-[#181818] mb-1.5">
                      Vos photos <span className="text-[#C2410C]">*</span>
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-2xl border-2 border-dashed border-[#EADFD5] hover:border-[#F97316] bg-white p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF1E6] text-[#F97316] flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-[#181818]">
                        Choisir des photos ou prendre un cliché
                      </span>
                      <span className="text-xs text-[#666666]">
                        JPG, PNG, WEBP — jusqu’à 6 photos à la fois
                      </span>
                    </button>

                    {previews.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2.5">
                        {previews.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative rounded-xl overflow-hidden aspect-square border border-[#EADFD5] bg-[#FFF1E6]"
                          >
                            <img
                              src={src}
                              alt={`Aperçu ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-red-700 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </p>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {isProcessing ? "Ajout en cours..." : "Ajouter à la galerie"}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                /* État après ajout dans la galerie + transmission directe à Joseph sur WhatsApp */
                <div className="space-y-5 text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF1E6] text-[#C2410C] flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="font-editorial text-2xl font-semibold text-[#181818]">
                      Merci {guestName} ! Vos photos ont été ajoutées à la galerie.
                    </h4>
                    <p className="mt-2 text-xs sm:text-sm text-[#666666] leading-relaxed">
                      Vos clichés apparaissent désormais dans l’album sur votre écran. Pour que{" "}
                      <strong className="text-[#181818]">{config.celebrantName}</strong> les
                      reçoive aussi en haute définition, envoyez-les maintenant sur WhatsApp :
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSendPhotosViaWhatsApp}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white text-sm font-semibold transition-colors cursor-pointer shadow-md"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Envoyer aussi mes photos sur WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={resetUploadModal}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#FFF1E6] border border-[#EADFD5] text-xs sm:text-sm font-semibold text-[#181818] transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-[#F97316]" />
                      <span>Voir mes photos dans la galerie</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox modale accessible */}
      {selectedIndex !== null && allImages[selectedIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vue agrandie : ${allImages[selectedIndex].alt}`}
          className="fixed inset-0 z-50 bg-[#181818]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barre supérieure de la lightbox */}
            <div className="w-full flex items-center justify-between text-[#FFFAF5] mb-4 px-2">
              <span className="text-sm font-medium tabular-nums text-[#FFFAF5]/80">
                Photo {selectedIndex + 1} sur {allImages.length}
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeLightbox}
                aria-label="Fermer la galerie (Échap)"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#F97316] text-white text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>Fermer</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image principale et boutons précédent / suivant */}
            <div className="relative w-full flex items-center justify-center">
              {allImages.length > 1 && (
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Photo précédente"
                  className="absolute left-2 sm:left-4 z-10 w-11 h-11 rounded-full bg-[#181818]/80 hover:bg-[#F97316] border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <img
                src={allImages[selectedIndex].url}
                alt={allImages[selectedIndex].alt}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full rounded-[20px] object-contain shadow-2xl border border-white/10"
              />

              {allImages.length > 1 && (
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Photo suivante"
                  className="absolute right-2 sm:right-4 z-10 w-11 h-11 rounded-full bg-[#181818]/80 hover:bg-[#F97316] border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {allImages[selectedIndex].caption && (
              <p className="mt-4 font-editorial text-2xl text-[#FFFAF5] text-center">
                {allImages[selectedIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
