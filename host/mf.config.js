const {shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'host',

  remotes: [
    {
      name: 'remote',
      entry: 'http://localhost:4201/remoteEntry.js',
      exposedModule: './Routes'
    },
    {
      name: 'remoteReact',
      entry: 'http://localhost:4202/remoteEntry.js',
      exposedModule: './App'
    }
  ],

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});