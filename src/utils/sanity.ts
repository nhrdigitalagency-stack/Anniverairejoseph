import { createClient } from "@sanity/client";
import { GalleryImage, SharedMemoryItem } from "../config/eventConfig";

export const SANITY_PROJECT_ID =
  import.meta.env.VITE_SANITY_PROJECT_ID || "5v2jzuxy";
export const SANITY_DATASET =
  import.meta.env.VITE_SANITY_DATASET || "production";
const SANITY_API_TOKEN =
  import.meta.env.VITE_SANITY_TOKEN ||
  "skXUZN91Zrs18KXs4cf5Lg61HhcQNcIoh6v1TEA7faFY6Bl9uzIhgIVupt5QRcZrfsGFzFMVagLIn5wG1Fp0eySRp1NRy5PK8Av22XUVb368cewvsaZCXgKXcxcscccw5livscDEYVKET7HgioEc5J31RBMQm231Q1bjE2FNe5J8qgWa68hr";

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-03-01",
  token: SANITY_API_TOKEN,
  useCdn: false, // useCdn: false pour que chaque nouvelle photo importée soit immédiatement visible par tous les invités
  ignoreBrowserTokenWarning: true,
});

export interface SanityGuestPhoto extends GalleryImage {
  guestName: string;
  createdAt?: string;
  isGuestUpload: true;
}

/**
 * Récupère toutes les photos importées par les invités depuis Sanity (triées de la plus récente à la plus ancienne).
 */
export async function fetchSanityGuestPhotos(): Promise<SanityGuestPhoto[]> {
  const query = `*[_type == "guestPhoto" && defined(image.asset)] | order(_createdAt desc) {
    "_id": _id,
    "guestName": coalesce(guestName, "Invité"),
    "caption": caption,
    "imageUrl": image.asset->url,
    "createdAt": _createdAt
  }`;

  const results = await sanityClient.fetch<
    Array<{
      _id: string;
      guestName: string;
      caption?: string;
      imageUrl: string | null;
      createdAt?: string;
    }>
  >(query);

  return (results || [])
    .filter((doc) => Boolean(doc.imageUrl))
    .map((doc) => {
      const cleanName = doc.guestName || "Invité";
      const cleanCaption = doc.caption || `Souvenir partagé par ${cleanName}`;
      return {
        id: doc._id,
        url: `${doc.imageUrl}?auto=format&w=1400&q=85`,
        alt: `${cleanCaption} (par ${cleanName})`,
        caption: cleanCaption,
        guestName: cleanName,
        createdAt: doc.createdAt,
        isGuestUpload: true,
        aspectRatio: "portrait",
      };
    });
}

/**
 * Importe un fichier image dans Sanity Assets et crée le document `guestPhoto` correspondant
 * pour qu'il soit visible par tous les visiteurs du site.
 */
export async function uploadGuestPhotoToSanity(params: {
  file: File | Blob;
  filename?: string;
  guestName: string;
  caption?: string;
}): Promise<SanityGuestPhoto> {
  const cleanName = params.guestName.trim() || "Invité";
  const cleanCaption =
    params.caption?.trim() || `Souvenir partagé par ${cleanName}`;

  const asset = await sanityClient.assets.upload("image", params.file, {
    filename: params.filename || `anniversaire-joseph-${Date.now()}.jpg`,
  });

  const createdDoc = await sanityClient.create({
    _type: "guestPhoto",
    guestName: cleanName,
    caption: cleanCaption,
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
    },
  });

  return {
    id: createdDoc._id,
    url: `${asset.url}?auto=format&w=1400&q=85`,
    alt: `${cleanCaption} (par ${cleanName})`,
    caption: cleanCaption,
    guestName: cleanName,
    createdAt: createdDoc._createdAt,
    isGuestUpload: true,
    aspectRatio: "portrait",
  };
}

/**
 * Supprime une photo invité de Sanity.
 */
export async function deleteGuestPhotoFromSanity(documentId: string): Promise<void> {
  await sanityClient.delete(documentId);
}

/**
 * Récupère les messages courts « Souvenirs en partage » depuis Sanity.
 */
export async function fetchSanitySharedMemories(): Promise<SharedMemoryItem[]> {
  const query = `*[_type == "sharedMemory"] | order(_createdAt desc) {
    "_id": _id,
    "author": author,
    "relation": relation,
    "message": message,
    "date": date,
    "approved": approved
  }`;

  const results = await sanityClient.fetch<
    Array<{
      _id: string;
      author: string;
      relation?: string;
      message: string;
      date?: string;
      approved?: boolean;
    }>
  >(query);

  return (results || []).map((doc) => ({
    id: doc._id,
    author: doc.author || "Invité",
    relation: doc.relation,
    message: doc.message || "",
    date: doc.date,
    approved: Boolean(doc.approved),
  }));
}

/**
 * Crée un nouveau message « Souvenir en partage » dans Sanity.
 */
export async function createSanitySharedMemory(item: {
  author: string;
  relation?: string;
  message: string;
  date: string;
  approved: boolean;
}): Promise<SharedMemoryItem> {
  const created = await sanityClient.create({
    _type: "sharedMemory",
    author: item.author,
    relation: item.relation,
    message: item.message,
    date: item.date,
    approved: item.approved,
  });

  return {
    id: created._id,
    author: item.author,
    relation: item.relation,
    message: item.message,
    date: item.date,
    approved: item.approved,
  };
}

/**
 * Met à jour le statut de validation (`approved`) d’un message dans Sanity.
 */
export async function toggleSanitySharedMemoryApproval(
  documentId: string,
  approved: boolean
): Promise<void> {
  await sanityClient.patch(documentId).set({ approved }).commit();
}

/**
 * Supprime un message de Sanity.
 */
export async function deleteSanitySharedMemory(documentId: string): Promise<void> {
  await sanityClient.delete(documentId);
}
