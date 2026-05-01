const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const packageJson = require('./package.json');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
    clean: true
  },
  devServer: {
    port: 3000,
    historyApiFallback: {
      rewrites: [{ from: /./, to: '/' }]
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'hostApp',
      filename: 'remoteEntry.js',
      remotes: {
        productsModule: 'productsModule@http://localhost:3001/remoteEntry.js',
        cartModule: 'cartModule@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: packageJson.dependencies.react,
          eager: true
        },
        'react-dom': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-dom'],
          eager: true
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};