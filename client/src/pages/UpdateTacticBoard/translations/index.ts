import i18next from "i18next";
import de from "./UpdateTacticBoard_de.json";
import en from "./UpdateTacticBoard_en.json";

export const namespace = "UpdateTacticBoard";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
