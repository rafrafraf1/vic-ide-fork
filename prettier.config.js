// @ts-check

/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrderTypeScriptVersion: "5.0.0",
  importOrder: [
    "<BUILTIN_MODULES>",
    "",
    "^react$",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^[.]",
  ],
};
