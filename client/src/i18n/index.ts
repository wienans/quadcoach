import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

let initPromise: Promise<void> | undefined;

export const initI18n = (): Promise<void> => {
  if (i18n.isInitialized) {
    return Promise.resolve();
  }

  initPromise ??= i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources: {},
      fallbackLng: "de",
      supportedLngs: ["de", "en"],
      nonExplicitSupportedLngs: true,
      load: "languageOnly",
      initAsync: false,
      react: {
        useSuspense: false,
      },
    })
    .then(() => undefined);

  return initPromise;
};

export const i18nReady = initI18n();

void i18nReady.catch((error) => {
  console.error("Failed to initialize i18n:", error);
});

export default i18n;
