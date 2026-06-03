/** Expo loads repo-root .env before this file runs. Fallbacks = Simulator dev defaults. */
const appJson = require("./app.json");

const thesisApiUrl =
  process.env.EXPO_PUBLIC_THESIS_API_URL || "http://127.0.0.1:8787";
const thesisAppKey =
  process.env.EXPO_PUBLIC_THESIS_APP_KEY || "dev-shared-secret-change-me";

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      infoPlist: {
        ...appJson.expo.ios?.infoPlist,
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    extra: {
      ...appJson.expo.extra,
      thesisApiUrl,
      thesisAppKey,
      eas: {
        projectId: "d25b92e4-cca0-4231-995e-827934fe51a6",
      },
    },
  },
};
