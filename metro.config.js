const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const purchasesJsUmd = path.resolve(
  __dirname,
  'node_modules/@revenuecat/purchases-js/dist/Purchases.umd.js',
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@revenuecat/purchases-js') {
    return { filePath: purchasesJsUmd, type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;