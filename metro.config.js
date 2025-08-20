// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withLibsodiumResolver } = require("@burnt-labs/abstraxion-react-native/metro.libsodium");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Your extra customizations
config.resolver.unstable_enablePackageExports = false;

// Apply both plugins
const libsodiumConfig = withLibsodiumResolver(config);
module.exports = withNativeWind(libsodiumConfig, { input: './global.css' });
