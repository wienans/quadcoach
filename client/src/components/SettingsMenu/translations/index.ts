import i18next from "i18next";
import en from "./SettingsMenu_en.json";
import de from "./SettingsMenu_de.json";

export const namespace = "SettingsMenu";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
