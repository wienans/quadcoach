import i18next from "i18next";
import en from "./AddPracticePlanDialog_en.json";
import de from "./AddPracticePlanDialog_de.json";

export const namespace = "AddPracticePlanDialog";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);