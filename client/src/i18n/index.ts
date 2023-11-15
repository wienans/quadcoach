import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// error handling of async catch, solution found on https://stackoverflow.com/a/46515787
(async () => {
  try {
    await i18n.use(initReactI18next).use(LanguageDetector).init({
      resources: {},
      fallbackLng: "de",
    });
  } catch (err) {
    console.error(err);
  }
})().catch((e) => {
  console.error(e);
});
