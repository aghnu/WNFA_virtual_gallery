import { type ImageMetaPayload } from "@type/ApiTypes";

const ASSETS_URL =
  "https://wnfa-interactive-art-project.github.io/hangzhou_060122/" as const;

export async function getImageResult(imageId: number): Promise<string> {
  const url = ASSETS_URL + "results/" + String(imageId) + ".jpg";
  const res = await fetch(url);
  return URL.createObjectURL(await res.blob());
}

export async function getImagePoster(imageId: number): Promise<string> {
  const url = ASSETS_URL + "posters/" + String(imageId) + ".jpg";
  const res = await fetch(url);
  return URL.createObjectURL(await res.blob());
}

export async function getImagesMeta(): Promise<ImageMetaPayload> {
  const url = ASSETS_URL + "META.json";
  const res = await fetch(url);
  return await res.json();
}
