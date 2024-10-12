import i18next from "i18next";
import de from "./VerifyEmail_de.json";
import en from "./VerifyEmail_en.json";

export const namespace = "VerifyEmail";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
