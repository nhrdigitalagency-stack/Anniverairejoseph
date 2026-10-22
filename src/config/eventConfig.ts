export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  time?: string; // Optional time, e.g., "19h30"
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  aspectRatio?: "portrait" | "square" | "wide";
}

export interface SharedMemoryItem {
  id: string;
  author: string;
  relation?: string;
  message: string;
  date?: string;
  approved: boolean;
}

export interface EventConfig {
  celebrantName: string;
  whatsappNumber: string;
  whatsappDisplayNumber: string;
  eventStart: string | null; // ISO date string with explicit offset e.g. "2026-10-31T19:30:00+01:00"
  eventEnd: string | null;   // ISO date string with explicit offset
  timeZone: string | null;   // e.g. "Europe/Paris"
  venueName: string;
  address: string;
  mapsUrl: string;
  dressCode: string;
  accessAndParking: string;
  portraitUrl: string;
  galleryImages: GalleryImage[];
  schedule: ScheduleItem[];
  scheduleConfirmed: boolean;
  sharedMemories: SharedMemoryItem[];
  rsvpDeadline: string | null;
  allowCompanions: boolean;
  maxCompanions: number;
  showGiftSection: boolean;
  siteUrl: string;
}

/**
 * Configuration centrale de l’anniversaire de Joseph.
 * Les informations non confirmées restent nulles ou vides afin de ne jamais afficher de données fictives.
 */
export const eventConfig: EventConfig = {
  celebrantName: "Joseph",
  whatsappNumber: "33753049353",
  whatsappDisplayNumber: "+33 7 53 04 93 53",
  eventStart: "2026-10-31T19:30:00+01:00",
  eventEnd: "2026-11-01T02:00:00+01:00",
  timeZone: "Europe/Paris",
  venueName: "",
  address: "",
  mapsUrl: "",
  dressCode: "",
  accessAndParking: "",
  portraitUrl: "/assets/aistudio/473b6477f7b10d1dd71f5dbf3418e73f_8f1cde7d.jpg",
  galleryImages: [
    {
      id: "joseph-portrait-1",
      url: "/assets/aistudio/473b6477f7b10d1dd71f5dbf3418e73f_8f1cde7d.jpg",
      alt: "Joseph souriant en costume rayé ajusté",
      caption: "L’élégance d’un instant partagé",
      aspectRatio: "portrait",
    },
    {
      id: "joseph-portrait-2",
      url: "/assets/aistudio/bfd85defb1b8c316733daf6a4f9dc73f_b97bbccb.jpg",
      alt: "Portrait éditorial de Joseph en pied",
      caption: "Une nouvelle année à célébrer",
      aspectRatio: "portrait",
    },
    {
      id: "joseph-portrait-3",
      url: "/assets/aistudio/49ee892fe2feb4e13fda96649825608b_2acf873f.jpg",
      alt: "Joseph de profil dans un jeu d’ombres et de lumière",
      caption: "Regard tourné vers l’avenir",
      aspectRatio: "portrait",
    },
    {
      id: "joseph-portrait-4",
      url: "/assets/aistudio/87cb3548fb580134696b22d86d6bbed1_6d9f98ed.jpg",
      alt: "Portrait studio de Joseph de face en clair-obscur",
      caption: "Caractère et sobriété",
      aspectRatio: "portrait",
    },
  ],
  scheduleConfirmed: true,
  schedule: [
    {
      id: "step-accueil",
      title: "Accueil des invités",
      description:
        "Arrivée tout en douceur, premiers échanges, rafraîchissements de bienvenue et retrouvailles chaleureuses.",
      time: "",
    },
    {
      id: "step-convivial",
      title: "Moment convivial",
      description:
        "Discussions, sourires partagés et dégustation autour d’une table pensée pour le plaisir d’être ensemble.",
      time: "",
    },
    {
      id: "step-gateau",
      title: "Gâteau et vœux",
      description:
        "L’instant fort de la soirée : souffler les bougies, porter un toast et célébrer cette nouvelle année entouré des proches.",
      time: "",
    },
    {
      id: "step-musique",
      title: "Musique et célébration",
      description:
        "Place à l’énergie, à la musique et à la piste de danse pour prolonger la fête et graver de beaux souvenirs.",
      time: "",
    },
  ],
  // Par défaut, aucun faux témoignage : seuls les messages ajoutés et validés s'affichent
  sharedMemories: [],
  rsvpDeadline: null,
  allowCompanions: true,
  maxCompanions: 5,
  showGiftSection: true,
  siteUrl: "",
};
