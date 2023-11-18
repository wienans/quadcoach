import i18next from "i18next";
import en from "./UpdateExercise_en.json";
import de from "./UpdateExercise_de.json";

export const namespace = "UpdateExercise";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
