module.exports = {

  entry: "./lib/index.ts",
  
  output : {
      path: __dirname + '/build' ,
      filename: 'bundle.js' ,
      library : ['electrum']
  },

  resolve: {
    extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
  },

  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  }
};