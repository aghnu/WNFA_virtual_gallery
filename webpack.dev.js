const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// get liquid template data
const getTemplateData = (resourcePath) => {
  const data = {
    constants: require("./src/data/constants.json"),
    iframePath: "./wnfa.html",
  };

  return data;
};

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",

  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "/"),
  },

  module: {
    rules: [
      {
        test: /\.liquid$/,
        use: [
          {
            loader: "html-loader",
          },
          {
            loader: "liquid-loader",
            options: {
              data: getTemplateData,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/template/index.liquid",
      inject: false,
    }),
    new HtmlWebpackPlugin({
      filename: "wnfa.html",
      template: "./src/template/wnfa.liquid",
    }),
  ],

  // devServer: {
  //   static: "./site",
  // },
});
