/** Temporary covers from annamanasaryan.com album thumbs — not a full archive dump. */
export const PREVIEW_COVERS: Record<string, string> = {
  "home-hero": "/photos/_preview/home-hero.jpg",
  newborn: "/photos/_preview/newborn.jpg",
  "newborn-images-0-1": "/photos/_preview/newborn.jpg",
  "newborn-home-discharge": "/photos/_preview/newborn-home.jpg",
  children: "/photos/_preview/children.jpg",
  "children-babies-1-12": "/photos/_preview/children-babies.jpg",
  "children-sessions": "/photos/_preview/children.jpg",
  "children-animals": "/photos/_preview/children-animals.jpg",
  family: "/photos/_preview/family.jpg",
  individual: "/photos/_preview/individual.jpg",
  "armenian-costumes": "/photos/_preview/costumes.jpg",
  underwater: "/photos/_preview/underwater.jpg",
  "smoke-paint": "/photos/_preview/smoke.jpg",
  seasonal: "/photos/_preview/seasonal.jpg",
  "seasonal-bloom": "/photos/_preview/seasonal-bloom.jpg",
  "seasonal-new-year": "/photos/_preview/seasonal-newyear.jpg",
  "seasonal-autumn": "/photos/_preview/seasonal.jpg",
  travel: "/photos/_preview/travel.jpg",
  "travel-armenia": "/photos/_preview/travel.jpg",
  "travel-italy": "/photos/_preview/travel.jpg",
  "travel-georgia": "/photos/_preview/travel.jpg",
  "travel-other": "/photos/_preview/travel.jpg",
  commercial: "/photos/_preview/commercial.jpg",
  "commercial-interiors": "/photos/_preview/commercial.jpg",
  "commercial-food": "/photos/_preview/food.jpg",
  "commercial-watches": "/photos/_preview/watches.jpg",
  "commercial-product": "/photos/_preview/watches.jpg",
  reportage: "/photos/_preview/reportage.jpg",
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
