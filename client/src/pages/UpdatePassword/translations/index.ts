import i18next from "i18next";
import de from "./UpdatePassword_de.json";
import en from "./UpdatePassword_en.json";

export const namespace = "UpdatePassword";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
