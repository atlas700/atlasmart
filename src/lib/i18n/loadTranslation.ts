// src/lib/i18n/loadTranslation.ts
import { i18nConfig, Locale } from "../../../i18n"; // adjust path as needed
import en from "@/translations/en.json";
import ps from "@/translations/ps.json";
import fr from "@/translations/fr.json";

/**
 * The shape of your translation data.
 * Derived from your default locale (`en.json`).
 */
export type TranslationObject = typeof en;

/**
 * Map each supported locale to a loader function.
 * Using Record<Locale, …> ensures you can’t accidentally
 * forget to add a new locale here without a compile‑time error.
 */
const translations: Record<Locale, () => Promise<TranslationObject>> = {
  en: () => Promise.resolve(en),
  ps: () => Promise.resolve(ps),
  fr: () => Promise.resolve(fr),
};

/**
 * Load the appropriate translations for `locale`,
 * falling back to the default locale if necessary.
 */
export const loadTranslation = async (
  locale: Locale
): Promise<TranslationObject> => {
  const loader = translations[locale];

  if (typeof loader === "function") {
    return await loader();
  }

  console.warn(
    `⚠️ No loader found for locale “${locale}”; falling back to “${i18nConfig.defaultLocale}”.`
  );

  // Non‑null assertion because defaultLocale is guaranteed in the Record
  return await translations[i18nConfig.defaultLocale]!();
};
