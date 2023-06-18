const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          // "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(mp3|ogg)$/,
        loader: "file-loader",
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      "@modules": path.resolve(__dirname, "src/modules/"),
      "@static": path.resolve(__dirname, "src/static/"),
      "@style": path.resolve(__dirname, "src/style/"),
      "@type": path.resolve(__dirname, "src/type/"),
      "@utilities": path.resolve(__dirname, "src/utilities/"),
      "@": path.resolve(__dirname, "src/"),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
};
