import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const babelOptions = {
  exclude: "node_modules/**",
  presets: ["@babel/preset-env"],
};

export default [
  {
    input: "src/index.js",
    output: [
      {
        file: "dist/replace.min.js",
        format: "umd",
        name: "replaceInHtml",
      },
    ],
    plugins: [babel({ ...babelOptions, babelHelpers: "bundled" }), terser()],
  },
  {
    external: [/@babel\/runtime/],
    input: "src/index.js",
    output: [
      {
        file: "dist/replace.cjs",
        format: "cjs",
        exports: "default",
      },
      {
        file: "dist/replace.mjs",
        format: "es",
      },
    ],
    plugins: [
      babel({
        ...babelOptions,
        babelHelpers: "runtime",
        plugins: ["@babel/plugin-transform-runtime"],
      }),
    ],
  },
];
