import i18next from "i18next";
import de from "./DraftingBoard_de.json";
import en from "./DraftingBoard_en.json";

export const namespace = "DraftingBoard";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);