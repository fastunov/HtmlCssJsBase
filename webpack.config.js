const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const projectContext = path.resolve(__dirname, 'src')
const outputDir = path.resolve(__dirname,'dist')
const entryPoint = './index.js'

const fileName = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`
const outputFile = fileName('js')
const cssFileName = fileName('css')
const indexFile = 'index.html'
const imageSourceDir = path.resolve(projectContext, 'img')
const iconsSourceDir = path.resolve(projectContext, 'icons')
const staticFilesDir = path.resolve(projectContext, 'static')
const imageDistDir = path.resolve(outputDir, 'img')
const iconsDistDir = imageDistDir
const staticDistDir = outputDir

const pugPagesDir = path.resolve(projectContext, 'pug/pages/')
const pugPagesList = fs.readdirSync(pugPagesDir).filter(fileName => fileName.endsWith('.pug'))

const postcssConfigFile = 'src/js/postcss.config.js'

const devToolOption = isDev ? 'source-map' : ''
const devServerPort = 3000

const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const {CleanWebpackPlugin} = require ('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: projectContext,
  mode: process.env.NODE_ENV,
  entry: entryPoint,
  output: {
    filename: outputFile,
    path: outputDir
  },
  devtool: devToolOption,
  devServer: {
    port: devServerPort,
    hot: isDev
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: cssFileName,
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: imageSourceDir, to: imageDistDir },
        { from: iconsSourceDir, to: iconsDistDir },
        { from: staticFilesDir, to: staticDistDir}
      ]
    }),
    new HtmlWebpackPlugin({
      template: indexFile,
      hash: false,
      minify: {
        removeComments: isProd,
        collapseWhitespace: isProd
      }
    }),
    ...pugPagesList.map(page => new HtmlWebpackPlugin({
      template: `${pugPagesDir}/${page}`,
      filename: `./${page.replace(/\.pug/,'.html')}`
    }))
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { 
              sourceMap: isDev 
            }
          }, {
            loader: 'postcss-loader',
            options: { 
              sourceMap: isDev, 
              config: { 
                path: postcssConfigFile 
              } 
            }
          }, {
            loader: 'sass-loader',
            options: { 
              sourceMap: isDev 
            }
          }
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
              loader: 'css-loader',
              options: { 
                sourceMap: isDev 
              }
          }, 
          {
            loader: 'postcss-loader',
            options: { 
              sourceMap: isDev, 
              config: { 
                path: postcssConfigFile 
              } 
            }
          }          
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            }
          }
        ] 
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      }    
    ]
  }
}