import * as Localization from "expo-localization";
import { I18nManager } from "react-native";
import { I18n } from "i18n-js";

const translations = {
  ar: {
    hello: "مرحبا",
  },
  en: {
    hello: "Hello",
  },
};

const i18n = new I18n(translations);

const locale = Localization.getLocales()[0]?.languageCode ?? "en";

i18n.locale = locale;
i18n.enableFallback = true;

if (locale === "ar") {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default i18n;