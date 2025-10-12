import i18next from "i18next";
import en from "./PracticePlanner_en.json";
import de from "./PracticePlanner_de.json";

export const namespace = "PracticePlanner";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);