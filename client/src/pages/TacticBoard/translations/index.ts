import i18next from "i18next";
import de from "./TacticBoard_de.json";
import en from "./TacticBoard_en.json";

export const namespace = "TacticBoard";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
