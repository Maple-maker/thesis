const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Simulator + Expo Go need IPv4/LAN — default [::1]-only bind breaks "Could not connect"
config.server = {
  ...config.server,
  host: "0.0.0.0",
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
