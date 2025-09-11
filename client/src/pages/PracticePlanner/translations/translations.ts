import i18next from "i18next";
import de from "./PracticePlanner_de.json";
import en from "./PracticePlanner_en.json";

export const namespace = "practicePlanner";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);