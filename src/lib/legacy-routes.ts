/** Old nested album URLs → flat category slugs. */
export const LEGACY_ALBUM_REDIRECTS: { category: string; album: string; to: string }[] = [
  { category: "newborn", album: "images-0-1", to: "newborn" },
  { category: "newborn", album: "home-discharge", to: "newborn" },
  { category: "children", album: "babies-1-12", to: "babies" },
  { category: "children", album: "sessions", to: "children" },
  { category: "children", album: "animals", to: "animals" },
  { category: "seasonal", album: "bloom", to: "bloom" },
  { category: "seasonal", album: "new-year", to: "new-year" },
  { category: "seasonal", album: "autumn", to: "autumn" },
  { category: "travel", album: "armenia", to: "travel" },
  { category: "travel", album: "italy", to: "travel" },
  { category: "travel", album: "georgia", to: "travel" },
  { category: "travel", album: "other", to: "travel" },
  { category: "commercial", album: "interiors", to: "interiors" },
  { category: "commercial", album: "food", to: "food" },
  { category: "commercial", album: "watches", to: "watches" },
  { category: "commercial", album: "product", to: "product" },
];

export const LEGACY_CATEGORY_REDIRECTS: { from: string; to: string }[] = [
  { from: "seasonal", to: "new-year" },
  { from: "commercial", to: "interiors" },
];

export function resolveLegacyAlbum(category: string, album: string): string | undefined {
  return LEGACY_ALBUM_REDIRECTS.find((item) => item.category === category && item.album === album)?.to;
}
