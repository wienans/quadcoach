import i18next from "i18next";
import de from "./Footer_de.json";
import en from "./Footer_en.json";

const namespace = "Footer";

i18next.addResourceBundle("de", namespace, de);
i18next.addResourceBundle("en", namespace, en);
