import i18next from "i18next";
import en from "./PracticePlanList_en.json";
import de from "./PracticePlanList_de.json";

export const namespace = "PracticePlanList";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);