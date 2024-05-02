import i18next from "i18next";
import de from "./Register_de.json";
import en from "./Register_en.json";

export const namespace = "Register";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
