const {shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'remote',
  filename: 'remoteEntry.js',

  exposes: {
    './Routes': './src/app/app.routes.ts'
  },

    shared: {
      ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    },
});