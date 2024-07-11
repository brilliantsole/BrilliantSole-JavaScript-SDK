import terser from "@rollup/plugin-terser";
import MagicString from "magic-string";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";

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
      "// BROWSER_START": isInBrowser ? "" : "/*",
      "// BROWSER_END": isInBrowser ? "" : "*/",
      "// NODE_START": isInNode ? "" : "/*",
      "// NODE_END": isInNode ? "" : "*/",
      "// LS_START": isInLensStudio ? "" : "/*",
      "// LS_END": isInLensStudio ? "" : "*/",
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

const _plugins = [typescript(), header()];

if (production) {
  _plugins.push(replaceEnvironment());
}

const _browserPlugins = [removeLines("browser"), commonjs(), resolve({ browser: true })];
const _nodePlugins = [removeLines("node")];
const nodeExternal = ["webbluetooth", "debounce", "ws", "@abandonware/noble"];

const lensStudioPlugins = [
  removeLines("ls"),
  resolve(),
  commonjs(),
  babel({
    babelHelpers: "bundled",
    exclude: "node_modules/**",
  }),
];

const name = "BS";
const input = "src/BS.ts";

const builds = [
  {
    input,
    plugins: [_browserPlugins, ..._plugins],
    output: [
      {
        format: "esm",
        file: "build/brilliantsole.module.js",
      },
    ],
  },
  {
    input,
    plugins: [..._browserPlugins, ..._plugins, terser()],
    output: [
      {
        format: "esm",
        file: "build/brilliantsole.module.min.js",
      },
    ],
  },

  {
    input,
    plugins: [..._browserPlugins, ..._plugins],
    output: [
      {
        format: "umd",
        name,
        file: "build/brilliantsole.js",
        indent: "\t",
      },
    ],
  },
  {
    input,
    plugins: [..._browserPlugins, ..._plugins, terser()],
    output: [
      {
        format: "umd",
        name,
        file: "build/brilliantsole.min.js",
      },
    ],
  },

  {
    input,
    plugins: [..._nodePlugins, ..._plugins],
    external: nodeExternal,
    output: [
      {
        format: "esm",
        file: "build/brilliantsole.node.module.js",
      },
    ],
  },
  {
    input,
    plugins: [..._nodePlugins, ..._plugins],
    external: nodeExternal,
    output: [
      {
        format: "cjs",
        name,
        file: "build/brilliantsole.cjs",
      },
    ],
  },

  {
    input,
    plugins: [...lensStudioPlugins, ..._plugins],
    output: [
      {
        format: "umd",
        name,
        file: "build/brilliantsole.ls.js",
      },
    ],
  },
];

export default builds;
