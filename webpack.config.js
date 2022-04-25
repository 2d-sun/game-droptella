const path = require("path")

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "protector.js",
  },
  module: {
    rules: [
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        // {
        //     test: /\.js$/,
        //     loader: "babel-loader",
        //     exclude: path.resolve(__dirname, "node_modules")
        // }
    ]
  },
  mode: "production"
}