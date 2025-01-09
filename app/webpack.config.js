// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: {
    app: './src/index.tsx',
    bugtracking: './src/utils/bugtracking.ts',
  },
  output: {
    chunkFilename: '[name].bundle.js',
    filename: '[name].bundle.js',
    path: `${__dirname}/build`,
  },
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      // name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/](react|react-dom|@material-ui|popper\.js|react|react-redux|prop-types|jss|redux|scheduler|react-transition-group)[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
        },
        default: {
          name: 'default',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  externals: {
    'edge-js': 'commonjs2 edge-js',
  },
  node: {
    __dirname: true,
    __filename: true,
  },
  devServer: {
    // contentBase: './dist', // content not from webpack
    hot: true,
    liveReload: true,
  },
  target: 'electron-renderer',
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.mjs', '.m.js', '.tsx', '.js', '.json', '.node'],
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            // options: {
            //   configFile: './tsconfig.json',
            // },
          },
        ],
        exclude: /node_modules/,
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.m?js$/, loader: 'source-map-loader' },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        include: /images/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
              publicPath: 'images/'
            }
          }
        ]
      },
      // {
      //   test: /\.node$/,
      //   use: {
      //     loader: 'node-loader',
      //     options: {
      //       modules: true,
      //     }
      //   }
      // },
    ],
  },
  // node: { global: true },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html', file: './build/index.html', inject: false }),
    // new BundleAnalyzerPlugin(),
    // new webpack.IgnorePlugin({
    //   resourceRegExp: /\.\/build\/Debug\/addon/,
    //   contextRegExp: /heapdump$/
    // }),
  ],

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    'electron-edge-js': 'commonjs2 electron-edge-js',
},
node: {
    __dirname: true,
    __filename: true,
},
  cache: {
    type: 'filesystem',
  },
  optimization: {
    runtimeChunk: 'single',
  },
}
