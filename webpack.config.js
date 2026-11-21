import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (env, argv) => ({
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: argv.mode === 'production' ? '[name].[contenthash].js' : '[name].js',
    publicPath: 'auto',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'classic' }]] },
        },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
  devServer: { port: 3000, hot: true },
  devtool: argv.mode === 'production' ? false : 'eval-source-map',
  performance: { hints: false },
});
