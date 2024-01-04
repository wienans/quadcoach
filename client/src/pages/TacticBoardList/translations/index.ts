import i18next from "i18next";
import en from "./TacticBoardList_en.json";
import de from "./TacticBoardList_de.json";

export const namespace = "TacticBoardList";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
