import i18next from "i18next";
import de from "./Exercise_de.json";
import en from "./Exercise_en.json";

export const namespace = "Exercise";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
