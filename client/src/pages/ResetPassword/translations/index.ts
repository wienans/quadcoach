import i18next from "i18next";
import de from "./ResetPassword_de.json";
import en from "./ResetPassword_en.json";

export const namespace = "ResetPassword";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
