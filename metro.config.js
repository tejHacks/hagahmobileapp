const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
// db: the bundled KJV Bible; wasm: expo-sqlite on web
config.resolver.assetExts.push("db", "wasm");

module.exports = config;
