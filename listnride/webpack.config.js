const path = require('path');
const fs = require('fs');

const jsonMinify = require('jsonminify');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const InlineChunksWebpackPlugin = require('inline-chunks-html-webpack-plugin');

const configValues = getConfigValues();

module.exports = (webpackEnv) => {

  return {
    entry: './app/index.js',
    output: {
      filename: '[name]-[contenthash:8].js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules|js_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: "> 0.5%, last 2 versions, Firefox ESR, not dead",
                    useBuiltIns: "usage",
                    corejs: "2.x"
                  }
                ]
              ],
              plugins: ['angularjs-annotate'],
              sourceMaps: true,
              cacheDirectory: true
            }
          }
        },
        {
          test: /\.css$/,
          include: /app|js_modules|node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '/'
              }
            },
            'css-loader',
            getPostcssLoader()
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          use: getImageLoaders(webpackEnv)
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[path][name]-[contenthash:8].[ext]'
            }
          }
        },
        {
          test: /\.template\.html$/,
          use: {
            loader: 'ng-cache-loader',
            options: {
              url: false,
              prefix: 'listnride:**',
              minimize: false
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        templateParameters: {
          ...configValues
        },
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          minifyJS: true
        }
      }),
      new webpack.ProvidePlugin({
        '$': 'jquery',
        'jquery': 'jquery',
        'jQuery': 'jquery',
        'window.$': 'jquery',
        'window.jquery': 'jquery',
        'window.jQuery': 'jquery',
        'window.moment': 'moment',
        'moment': 'moment',
        '_': 'lodash'
      }),
      new webpack.DefinePlugin({
          ...getConfigDefinitions(configValues),
      }),
      new MiniCssExtractPlugin({
        filename: 'app/assets/stylesheets/[name]-[contenthash:8].css'
      }),
      new CopyWebpackPlugin([
        {
          from: 'app/assets/downloads/*'
        },
        getTranslationProcessingConfig(webpackEnv)
      ]),
      new CleanWebpackPlugin()
    ],
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendors: {
            chunks: 'all',
            name: 'vendor',
            test: /node_modules|js_modules/
          }
        }
      },
      minimizer: [
        new TerserPlugin({
          sourceMap: true,
          terserOptions: {
            safari10: true,
            mangle: {
              // Pass true to work around the Safari 10 loop iterator bug "Cannot declare a let variable twice"
              safari10: true
            }
          }
        }),
        new OptimizeCssAssetsPlugin({
          cssProcessor: require('cssnano'),
          cssProcessorOptions: {
            autoprefixer: false,
            zindex: false,
            reduceIdents: false,
            mergeIdents: false,
            discardUnused: false
          }
        }),
        new InlineChunksWebpackPlugin({
          //inline runtime chunk into HTML to avoid extra HTTP request
          inlineChunks: ['runtime']
        })
      ]
    },
    devtool: webpackEnv.production ? 'source-map' : 'inline-source-map',
    devServer: {
      port: webpackEnv.PORT || 8080,
      https: true,
      historyApiFallback: true,
      stats: 'minimal'
    },
    stats: {
      children: false
    }
  };
};

const getImageLoaders = (webpackEnv) => {
  const loaders = [
    {
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]'
      }
    }
  ];

  if(webpackEnv.production)  {
    loaders.push({
      loader: 'image-webpack-loader',
      options: {
        mozjpeg: {
          progressive: true
        },
        optipng: {
          optimizationLevel: 7,
          bitDepthReduction: true,
          colorTypeReduction: true
        },
        gifsicle: {
          interlaced: true,
        },
        svgo: {
          plugins: [
            {removeViewBox: false}
          ]
        }
      }
    });
  }

  return loaders;
};

const getTranslationProcessingConfig = (webpackEnv) => {
  const config = {
    from: 'app/i18n/**/*.json',
  };

  // JSON minification is heavy operation - enable only in production
  if(webpackEnv.production) {
    config.transform = (contentsBuffer) => jsonMinify(contentsBuffer.toString())
  }

  return config;
}

const getPostcssLoader = () => ({
  loader: 'postcss-loader',
  options: {
    sourceMap: true,
    plugins: [
      require('postcss-preset-env')()
    ]
  }
});

function getConfigValues() {
  const ENV_PREFIX = 'LNR_';
  const configValues = Object.entries(process.env)
    .filter(([name, value]) => name.startsWith(ENV_PREFIX))
    .reduce(
      (result, [name, value]) => ({...result, [name]: value}),
      {}
    );
  return configValues;
};

const getConfigDefinitions = (configValues) => {
  return Object.entries(configValues)
    .reduce(
      (result, [name, value]) => ({...result, [`process.env.${name}`]: JSON.stringify(value)}),
      {}
    );
};
