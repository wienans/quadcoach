import i18next from "i18next";
import de from "./PracticePlanner_de.json";
import en from "./PracticePlanner_en.json";

const namespace = "PracticePlanner";

i18next.addResourceBundle("de", namespace, de);
i18next.addResourceBundle("en", namespace, en);