/** Temporary covers from annamanasaryan.com album thumbs — not a full archive dump. */
export const PREVIEW_COVERS: Record<string, string> = {
  "home-hero": "/photos/_preview/home-hero.jpg",
  newborn: "/photos/_preview/newborn.jpg",
  babies: "/photos/_preview/children-babies.jpg",
  children: "/photos/_preview/children.jpg",
  animals: "/photos/_preview/children-animals.jpg",
  family: "/photos/_preview/family.jpg",
  individual: "/photos/_preview/individual.jpg",
  "armenian-costumes": "/photos/_preview/costumes.jpg",
  underwater: "/photos/_preview/underwater.jpg",
  "smoke-paint": "/photos/_preview/smoke.jpg",
  "new-year": "/photos/_preview/seasonal-newyear.jpg",
  bloom: "/photos/_preview/seasonal-bloom.jpg",
  autumn: "/photos/_preview/seasonal.jpg",
  interiors: "/photos/_preview/commercial.jpg",
  watches: "/photos/_preview/watches.jpg",
  food: "/photos/_preview/food.jpg",
  product: "/photos/_preview/watches.jpg",
  reportage: "/photos/_preview/reportage.jpg",
  video: "/photos/_preview/training.jpg",
  travel: "/photos/_preview/travel.jpg",
  ai: "/photos/_preview/individual.jpg",
  phototour: "/photos/_preview/travel.jpg",
  backstage: "/photos/_preview/training.jpg",
  training: "/photos/_preview/training.jpg",
};

export function getPreviewCover(slug: string): string | undefined {
  if (PREVIEW_COVERS[slug]) return PREVIEW_COVERS[slug];
  const match = Object.keys(PREVIEW_COVERS)
    .sort((a, b) => b.length - a.length)
    .find((key) => slug.startsWith(`${key}-`));
  return match ? PREVIEW_COVERS[match] : undefined;
}
