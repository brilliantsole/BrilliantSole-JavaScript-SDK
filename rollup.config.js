import terser from "@rollup/plugin-terser";
import MagicString from "magic-string";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";
import cleanup from "rollup-plugin-cleanup";

const production = !process.env.ROLLUP_WATCH;

function header() {
  return {
    renderChunk(code) {
      code = new MagicString(code);

      code.prepend(`/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */\n`);

      return {
        code: code.toString(),
        map: code.generateMap(),
      };
    },
  };
}

/** @param {"node" | "browser" | "ls"} context  */
function removeLines(context) {
  const isInBrowser = context == "browser";
  const isInNode = context == "node";
  const isInLensStudio = context == "ls";

  return replace({
    preventAssignment: true,
    delimiters: ["", ""],
    values: {
      "/** BROWSER_START */": isInBrowser ? "" : "/*",
      "/** BROWSER_END */": isInBrowser ? "" : "*/",
      "/** NODE_START */": isInNode ? "" : "/*",
      "/** NODE_END */": isInNode ? "" : "*/",
      "/** LS_START */": isInLensStudio ? "" : "/*",
      "/** LS_END */": isInLensStudio ? "" : "*/",
    },
  });
}

function replaceEnvironment() {
  return replace({
    preventAssignment: true,
    values: {
      __BRILLIANTSOLE__ENVIRONMENT__: JSON.stringify("__BRILLIANTSOLE__PROD__"),
    },
  });
}

const _plugins = [
  typescript(),
  cleanup({ comments: "none", extensions: ["js", "ts"] }),
  header(),
];

if (production) {
  _plugins.push(replaceEnvironment());
}

const _browserPlugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  removeLines("browser"),
];
const _nodePlugins = [removeLines("node")];
const nodeExternal = [
  "webbluetooth",
  "debounce",
  "ws",
  "@abandonware/noble",
  "auto-bind",
  "dgram",
  "rgbquant",
  "opentype.js",
  "woff2-encoder",
  "svgson",
  "svg-pathdata",
  "simplify-js",
  "fit-curve",
  "os",
  "alawmulaw",
];

const lensStudioPlugins = [
  removeLines("ls"),
  resolve(),
  commonjs(),
  babel({
    babelHelpers: "bundled",
    extensions: [".ts", ".js"], // <-- important
    exclude: "node_modules/**",
    presets: [
      [
        "@babel/preset-env",
        {
          targets: "> 0.25%, not dead",
        },
      ],
      "@babel/preset-typescript",
    ],
    plugins: [
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator",
    ],
  }),
];

const name = "BS";
const input = "src/BS.ts";

const defaultOutput = {
  sourcemap: true,
  sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
    return relativeSourcePath.replace("../src/", "../brilliantsole/");
  },
};

const warningsToIgnore = ["PLUGIN_WARNING", "CIRCULAR_DEPENDENCY"];
const onwarn = (warning) => {
  if (warningsToIgnore.includes(warning.code)) {
    return;
  }
  console.warn(warning);
};

const defaultBuild = {
  watch: {
    clearScreen: false,
  },
  onwarn,
};

const builds = [
  {
    input,
    plugins: [..._browserPlugins, ..._plugins],
    output: [
      {
        ...defaultOutput,
        format: "esm",
        file: "build/brilliantsole.module.js",
      },
    ],
    ...defaultBuild,
  },
  {
    input: "./build/dts/BS.d.ts",
    output: [{ file: "build/index.d.ts", format: "es" }],
    plugins: [
      removeLines("browser"),
      dts(),
      copy({
        targets: [
          {
            src: "build/index.d.ts",
            dest: "build",
            rename: "brilliantsole.module.d.ts",
          },
          {
            src: "build/index.d.ts",
            dest: "build",
            rename: "brilliantsole.module.min.d.ts",
          },
        ],
      }),
    ],
    ...defaultBuild,
  },

  {
    input,
    plugins: [..._nodePlugins, ..._plugins],
    external: nodeExternal,
    output: [
      {
        ...defaultOutput,
        format: "esm",
        file: "build/brilliantsole.node.module.js",
      },
    ],
    ...defaultBuild,
  },
  {
    input: "./build/dts/BS.d.ts",
    output: [{ file: "build/index.node.d.ts", format: "es" }],
    external: nodeExternal,
    plugins: [
      removeLines("node"),
      dts(),
      copy({
        targets: [
          {
            src: "build/index.node.d.ts",
            dest: "build",
            rename: "brilliantsole.node.module.d.ts",
          },
        ],
      }),
    ],
    ...defaultBuild,
  },
];

const productionOnlyBuilds = [
  {
    input,
    plugins: [..._browserPlugins, ..._plugins, terser()],
    output: [
      {
        ...defaultOutput,
        format: "esm",
        file: "build/brilliantsole.module.min.js",
      },
    ],
    ...defaultBuild,
  },
  {
    input,
    plugins: [..._browserPlugins, ..._plugins],
    output: [
      {
        name,
        ...defaultOutput,
        format: "umd",
        file: "build/brilliantsole.js",
        indent: "\t",
      },
    ],
    ...defaultBuild,
  },
  {
    input,
    plugins: [..._browserPlugins, ..._plugins, terser()],
    output: [
      {
        ...defaultOutput,
        format: "umd",
        name,
        file: "build/brilliantsole.min.js",
      },
    ],
    ...defaultBuild,
  },

  {
    input,
    plugins: [..._nodePlugins, ..._plugins],
    external: nodeExternal,
    output: [
      {
        ...defaultOutput,
        format: "cjs",
        name,
        file: "build/brilliantsole.cjs",
      },
    ],
    ...defaultBuild,
  },
  {
    input,
    plugins: [...lensStudioPlugins, ..._plugins],
    output: [
      {
        ...defaultOutput,
        format: "umd",
        name,
        file: "build/brilliantsole.ls.js",
      },
    ],
    ...defaultBuild,
  },
];

if (production) {
  builds.push(...productionOnlyBuilds);
}

export default builds;
