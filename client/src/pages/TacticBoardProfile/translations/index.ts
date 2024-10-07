import i18next from "i18next";
import en from "./TacticBoardProfile_en.json";
import de from "./TacticBoardProfile_de.json";

export const namespace = "TacticBoardProfile";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
