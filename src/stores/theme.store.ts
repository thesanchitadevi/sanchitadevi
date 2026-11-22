import { atom, computed } from "nanostores";
import {
  detectCurrentOccasion,
  getThemeById,
  generateFaviconDataUri,
  type ThemeConfig,
} from "../utils/themeEvents";

export interface ActiveThemeState {
  theme: ThemeConfig;
  isAuto: boolean;
  detectedOccasion: ThemeConfig | null;
}

// Stores 'auto' or a query override
export const selectedThemeId = atom<string>("auto");

// Current calendar detected occasion
export const currentOccasion = atom<ThemeConfig | null>(null);

// Resolved active theme
export const activeThemeState = computed(
  [selectedThemeId, currentOccasion],
  (selectedId, detected): ActiveThemeState => {
    if (selectedId === "auto") {
      const active = detected || getThemeById("prussian");
      return {
        theme: active,
        isAuto: true,
        detectedOccasion: detected,
      };
    }

    const manual = getThemeById(selectedId);
    return {
      theme: manual,
      isAuto: false,
      detectedOccasion: detected,
    };
  }
);

/**
 * Applies the given theme and favicon to the DOM
 */
export function applyThemeToDOM(theme: ThemeConfig) {
  if (typeof document === "undefined") return;

  // 1. Set data-theme attribute on <html>
  document.documentElement.setAttribute("data-theme", theme.id);

  // 2. Set or update favicon
  const faviconUrl = theme.faviconSvg
    ? generateFaviconDataUri(theme.faviconSvg)
    : "/favicon.svg";

  let iconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.rel = "icon";
    document.head.appendChild(iconLink);
  }
  iconLink.type = "image/svg+xml";
  iconLink.href = faviconUrl;
}

/**
 * Automatically initializes theme from calendar or URL parameter
 */
export function initThemeSystem() {
  if (typeof window === "undefined") return;

  let testDate: Date = new Date();

  // Allow URL testing param like ?date=2026-12-25 or ?theme=christmas
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("date");
    let themeParam = urlParams.get("theme");

    if (themeParam) {
      if (themeParam === "auto" || themeParam === "reset") {
        try { sessionStorage.removeItem("preview_theme"); } catch (e) {}
        themeParam = null;
      } else {
        try { sessionStorage.setItem("preview_theme", themeParam); } catch (e) {}
      }
    } else {
      try { themeParam = sessionStorage.getItem("preview_theme"); } catch (e) {}
    }

    if (themeParam) {
      selectedThemeId.set(themeParam);
      const manual = getThemeById(themeParam);
      applyThemeToDOM(manual);
      return;
    }

    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        testDate = parsed;
      }
    }
  } catch (e) {}

  // Automatically detect based on the calendar date
  const detected = detectCurrentOccasion(testDate);
  currentOccasion.set(detected);
  selectedThemeId.set("auto");

  // Apply resolved theme
  const resolved = activeThemeState.get();
  applyThemeToDOM(resolved.theme);
}
