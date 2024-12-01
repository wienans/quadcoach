import i18next from "i18next";
import en from "./UserProfile_en.json";
import de from "./UserProfile_de.json";

export const namespace = "UserProfile";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
