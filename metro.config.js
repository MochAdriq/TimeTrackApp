const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const svgTransformer = require('react-native-svg-transformer'); // Impor transformer
const defaultConfig = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'), // Gunakan transformer
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'), // Hapus SVG dari aset biasa
    sourceExts: [...sourceExts, 'svg'], // Tambahkan SVG sebagai source code
  },
};

module.exports = mergeConfig(defaultConfig, config);
