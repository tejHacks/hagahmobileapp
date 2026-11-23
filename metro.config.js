const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
// config.resolver.assetExts.push("bjson", "db");
config.resolver.assetExts.push('db', 'wasm'); // wasm: expo-sqlite on web
module.exports = withNativeWind(config, { input: "./global.css" });