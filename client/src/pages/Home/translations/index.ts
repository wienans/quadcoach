import i18next from "i18next";
import de from "./Home_de.json";
import en from "./Home_en.json";

export const namespace = "Home";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
