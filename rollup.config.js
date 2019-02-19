import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import { main, module } from "./package.json";

const plugins = [nodeResolve(), commonjs()];

const external = ["dotenv"];

export default [
  {
    input: "src/index.js",
    output: [{ file: main, format: "cjs" }, { file: module, format: "esm" }],
    plugins,
    external,
  },
  {
    input: "src/config.js",
    output: [
      { file: "dist/config.js", format: "cjs" },
      { file: "dist/config.m.js", format: "esm" },
    ],
    plugins,
    external,
  },
];
