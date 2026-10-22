import React, { useState, useEffect, useCallback } from "react";
import {
  Quote,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Trash2,
  Send,
  X,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EventConfig, SharedMemoryItem } from "../config/eventConfig";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import {
  fetchSanitySharedMemories,
  createSanitySharedMemory,
  toggleSanitySharedMemoryApproval,
  deleteSanitySharedMemory,
} from "../utils/sanity";

interface SharedMemoriesProps {
  config: EventConfig;
  onUpdateConfig?: (nextConfig: EventConfig) => void;
}

export const SharedMemories: React.FC<SharedMemoriesProps> = ({ config }) => {
  const [sanityMemories, setSanityMemories] = useState<SharedMemoryItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [moderationOpen, setModerationOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [relation, setRelation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const loadMemories = useCallback(async () => {
    try {
      const items = await fetchSanitySharedMemories();
      setSanityMemories(items);
    } catch {
      // Conserver les souvenirs déjà chargés en cas d'erreur réseau
    }
  }, []);

  useEffect(() => {
    loadMemories();
    const interval = window.setInterval(loadMemories, 25000);
    return () => window.clearInterval(interval);
  }, [loadMemories]);

  const configMemories = Array.isArray(config.sharedMemories) ? config.sharedMemories : [];
  const allMemories: SharedMemoryItem[] = [
    ...sanityMemories,
    ...configMemories.filter((cm) => !sanityMemories.some((sm) => sm.id === cm.id)),
  ];

  const approvedMemories = allMemories.filter((item) => item.approved);
  const pendingMemories = allMemories.filter((item) => !item.approved);

  const handleSubmitMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setError("Veuillez indiquer votre prénom.");
      return;
    }
    if (!message.trim()) {
      setError("Veuillez écrire votre court message de félicitations.");
      return;
    }
    if (message.trim().length > 280) {
      setError("Votre texte court ne doit pas dépasser 280 caractères.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createSanitySharedMemory({
        author: author.trim(),
        relation: relation.trim() || undefined,
        message: message.trim(),
        date: new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "short",
        }).format(new Date()),
        approved: false,
      });

      setSanityMemories((prev) => [created, ...prev]);
      setSubmittedNotice(true);
      setAuthor("");
      setRelation("");
      setMessage("");
    } catch {
      setError("Impossible d’enregistrer votre message pour le moment. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleApprove = async (item: SharedMemoryItem) => {
    const nextApproved = !item.approved;
    setSanityMemories((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, approved: nextApproved } : m))
    );
    try {
      await toggleSanitySharedMemoryApproval(item.id, nextApproved);
    } catch {
      loadMemories();
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setSanityMemories((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteSanitySharedMemory(id);
    } catch {
      loadMemories();
    }
  };

  const handleSendForValidationWhatsApp = (item: SharedMemoryItem) => {
    const text = [
      `Bonjour, je souhaite proposer un mot pour la section « Souvenirs en partage » de l’anniversaire de ${config.celebrantName} :`,
      "",
      `Prénom : ${item.author}${item.relation ? ` (${item.relation})` : ""}`,
      `Message : « ${item.message} »`,
    ].join("\n");

    const url = buildWhatsAppUrl(text, config.whatsappNumber);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <section
      id="souvenirs-partage"
      aria-labelledby="shared-memories-title"
      className="py-16 sm:py-24 bg-[#FFFAF5] border-b border-[#EADFD5] relative overflow-hidden"
    >
      {/* Halo décoratif chaud */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full bg-[#FFF1E6] opacity-60 blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#C2410C]">
              Souvenirs en partage
            </p>
            <h2
              id="shared-memories-title"
              className="mt-2 font-editorial text-3xl sm:text-5xl font-semibold text-[#181818] tracking-tight text-balance"
            >
              Mots choisis & Félicitations
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#666666] leading-relaxed">
              Retrouvez ici les courts messages de félicitations validés par l’organisation pour
              célébrer {config.celebrantName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSubmittedNotice(false);
                setFormOpen((prev) => !prev);
              }}
              className="btn-interactive inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white text-sm font-semibold shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Proposer un mot court</span>
            </button>

            <button
              type="button"
              onClick={() => setModerationOpen((prev) => !prev)}
              aria-expanded={moderationOpen}
              className="btn-interactive inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#FFF1E6] border border-[#EADFD5] text-xs sm:text-sm font-semibold text-[#181818] cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
              <span>
                Modération
                {pendingMemories.length > 0 ? ` (${pendingMemories.length} en attente)` : ""}
              </span>
            </button>
          </div>
        </div>

        {/* Formulaire de proposition d'un texte court */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mt-8 rounded-[24px] bg-white border border-[#EADFD5] p-6 sm:p-8 shadow-[0_12px_36px_rgba(24,24,24,0.05)] max-w-2xl"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="font-editorial text-2xl font-semibold text-[#181818]">
                  Proposer une félicitation courte
                </h3>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label="Fermer le formulaire"
                  className="w-8 h-8 rounded-lg border border-[#EADFD5] flex items-center justify-center text-[#666666] hover:text-[#181818] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!submittedNotice ? (
                <form onSubmit={handleSubmitMemory} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="memory-author"
                        className="block text-xs font-semibold text-[#181818] mb-1.5"
                      >
                        Votre prénom <span className="text-[#C2410C]">*</span>
                      </label>
                      <input
                        id="memory-author"
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Ex. : Romaric"
                        className="w-full rounded-xl border border-[#EADFD5] px-3.5 py-2.5 text-sm text-[#181818] bg-[#FFFAF5] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="memory-relation"
                        className="block text-xs font-semibold text-[#181818] mb-1.5"
                      >
                        Lien ou clin d’œil{" "}
                        <span className="font-normal text-[#666666]">(facultatif)</span>
                      </label>
                      <input
                        id="memory-relation"
                        type="text"
                        value={relation}
                        onChange={(e) => setRelation(e.target.value)}
                        placeholder="Ex. : Ami d’enfance, Famille..."
                        className="w-full rounded-xl border border-[#EADFD5] px-3.5 py-2.5 text-sm text-[#181818] bg-[#FFFAF5] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="memory-text"
                        className="block text-xs font-semibold text-[#181818]"
                      >
                        Votre mot de félicitations <span className="text-[#C2410C]">*</span>
                      </label>
                      <span className="text-xs text-[#666666] tabular-nums">
                        {message.length} / 280
                      </span>
                    </div>
                    <textarea
                      id="memory-text"
                      rows={3}
                      maxLength={280}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Un court souvenir ou vœu pour ${config.celebrantName}...`}
                      className="w-full rounded-xl border border-[#EADFD5] px-3.5 py-2.5 text-sm text-[#181818] bg-[#FFFAF5] focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-red-700 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-[#666666]">
                      Soumis à validation dans le panneau de modération avant affichage public.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181818] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
                    >
                      <Send className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>
                        {isSubmitting ? "Enregistrement..." : "Soumettre à validation"}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-3 space-y-4">
                  <div className="flex items-start gap-3 text-sm text-[#181818]">
                    <Clock className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        Votre message a été enregistré et placé en attente de modération.
                      </p>
                      <p className="mt-1 text-xs text-[#666666]">
                        Une fois validé via le bouton « Modération », il sera visible par tous les
                        invités sur le site.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setModerationOpen(true);
                        setFormOpen(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold cursor-pointer"
                    >
                      Ouvrir la modération simplifiée
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmittedNotice(false)}
                      className="px-4 py-2 rounded-xl border border-[#EADFD5] text-xs font-semibold text-[#181818] cursor-pointer"
                    >
                      Écrire un autre mot
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panneau de modération simplifiée synchronisé avec Sanity */}
        <AnimatePresence>
          {moderationOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mt-8 rounded-[24px] bg-[#181818] text-[#FFFAF5] p-6 sm:p-8 border border-white/10 shadow-xl"
            >
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#F97316]" />
                  <div>
                    <h3 className="font-editorial text-2xl font-semibold text-white">
                      Modération simplifiée des souvenirs
                    </h3>
                    <p className="text-xs text-white/70">
                      Validez ou masquez en un clic les messages courts pour les afficher à tous
                      les visiteurs.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModerationOpen(false)}
                  aria-label="Fermer la modération"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {allMemories.length === 0 ? (
                <p className="text-xs sm:text-sm text-white/70 py-4 text-center border border-dashed border-white/15 rounded-2xl">
                  Aucun message n’a encore été soumis. Cliquez sur « Proposer un mot court » pour
                  tester l’ajout et la validation.
                </p>
              ) : (
                <div className="space-y-3">
                  {allMemories.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-white">{item.author}</span>
                          {item.relation && (
                            <span className="text-white/60">· {item.relation}</span>
                          )}
                          <span className="text-white/40">·</span>
                          <span
                            className={`font-semibold ${
                              item.approved ? "text-emerald-400" : "text-[#F97316]"
                            }`}
                          >
                            {item.approved ? "Validé (affiché à tous)" : "En attente"}
                          </span>
                        </div>
                        <p className="text-sm text-white/90 italic">« {item.message} »</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleApprove(item)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            item.approved
                              ? "bg-white/10 hover:bg-white/20 text-white"
                              : "bg-[#F97316] hover:bg-[#C2410C] text-white"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {item.approved ? "Retirer de l’affichage" : "Valider & Afficher"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendForValidationWhatsApp(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium cursor-pointer"
                        >
                          <Send className="w-3 h-3 text-[#F97316]" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMemory(item.id)}
                          aria-label="Supprimer ce message"
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Affichage public : uniquement les messages validés, ou message par défaut si rien n'est validé */}
        {approvedMemories.length === 0 ? (
          <div className="mt-12 rounded-[28px] bg-gradient-to-br from-[#FFF1E6]/80 via-white to-[#FFF1E6]/50 border border-[#EADFD5] p-10 sm:p-14 text-center max-w-3xl mx-auto shadow-[0_10px_30px_rgba(24,24,24,0.03)]">
            <p className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181818]">
              Les premiers mots de félicitations validés s’afficheront ici très prochainement.
            </p>
            <p className="mt-2.5 text-sm sm:text-base text-[#666666] max-w-lg mx-auto leading-relaxed">
              Partagez un vœu court ou un souvenir marquant avec {config.celebrantName} : une fois
              validé par l’organisation, il rejoindra ce mur d’attentions.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedMemories.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] bg-white border border-[#EADFD5] p-7 sm:p-8 shadow-[0_10px_30px_rgba(24,24,24,0.04)] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
              >
                <div>
                  <Quote className="w-7 h-7 text-[#F97316]/40 mb-4" />
                  <p className="font-editorial text-xl sm:text-2xl italic text-[#181818] leading-relaxed">
                    « {item.message} »
                  </p>
                </div>

                <footer className="mt-6 pt-4 border-t border-[#EADFD5]/70 flex items-center justify-between text-xs text-[#666666]">
                  <div>
                    <span className="font-semibold text-[#181818] text-sm">{item.author}</span>
                    {item.relation && <span> · {item.relation}</span>}
                  </div>
                  {item.date && <span>{item.date}</span>}
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
