import i18next from "i18next";
import en from "./ExerciseList_en.json";
import de from "./ExerciseList_de.json";

export const namespace = "ExerciseList";

i18next.addResourceBundle("de", namespace, de, true, true);
i18next.addResourceBundle("en", namespace, en, true, true);
