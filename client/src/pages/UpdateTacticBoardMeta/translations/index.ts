import i18next from "i18next";
import de from "./UpdateTacticBoardMeta_de.json";
import en from "./UpdateTacticBoardMeta_en.json";

export const namespace = "UpdateTacticBoardMeta";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
