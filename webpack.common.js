const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// get liquid template data
const getTemplateData = (resourcePath) => {
  const data = {
    constants: require("./src/data/constants.json"),
  };

  return data;
};

module.exports = {
  entry: "./src/js/main.js",

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
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
};
