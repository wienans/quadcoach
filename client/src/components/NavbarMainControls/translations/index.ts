import i18next from "i18next";
import en from "./NavbarMainControls_en.json";
import de from "./NavbarMainControls_de.json";

export const namespace = "NavbarMainControls";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
