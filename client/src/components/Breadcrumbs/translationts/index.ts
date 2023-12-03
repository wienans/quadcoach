import i18next from "i18next";
import de from "./Breadcrumbs_de.json";
import en from "./Breadcrumbs_en.json";

export const namespace = "Breadcrumbs";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
