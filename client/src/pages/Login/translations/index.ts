import i18next from "i18next";
import de from "./Login_de.json";
import en from "./Login_en.json";

export const namespace = "Login";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
