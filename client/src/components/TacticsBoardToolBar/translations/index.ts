import i18next from "i18next";
import de from "./TacticsBoardToolBar_de.json";
import en from "./TacticsBoardToolBar_en.json";

export const namespace = "TacticsBoardToolBar";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
