export const THEMES = ["beige", "white", "black"] as const;

export type ThemeId = (typeof THEMES)[number];

export const THEME_LABELS: Record<ThemeId, string> = {
  beige: "Бежевый",
  white: "Белый",
  black: "Чёрный",
};

export const THEME_SWATCHES: Record<ThemeId, string> = {
  beige: "#f3efe8",
  white: "#ffffff",
  black: "#000000",
};

const LEGACY: Record<string, ThemeId> = {
  dark: "beige",
  gray: "beige",
};

export function isTheme(value: string | null | undefined): value is ThemeId {
  return value === "beige" || value === "white" || value === "black";
}

export function resolveTheme(value: string | null | undefined): ThemeId {
  if (isTheme(value)) return value;
  if (value && isTheme(LEGACY[value])) return LEGACY[value];
  return "beige";
}

export function isLightTheme(theme: ThemeId) {
  return theme !== "black";
}
