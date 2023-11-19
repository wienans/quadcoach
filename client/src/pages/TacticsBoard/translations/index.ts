import i18next from "i18next";
import de from "./TacticsBoard_de.json";
import en from "./TacticsBoard_en.json";

export const namespace = "TacticsBoard";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
