module.exports = {
  extends: [
    "airbnb-base",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
  ],

  plugins: ["import", "jest"],

  rules: {
    "arrow-parens": ["error", "as-needed"],
  },
};
