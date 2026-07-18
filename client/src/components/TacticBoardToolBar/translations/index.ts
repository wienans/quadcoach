import i18next from "../../../i18n";
import de from "./TacticBoardToolBar_de.json";
import en from "./TacticBoardToolBar_en.json";

export const namespace = "TacticBoardToolBar";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
