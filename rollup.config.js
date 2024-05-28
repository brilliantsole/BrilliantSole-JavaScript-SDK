import terser from "@rollup/plugin-terser";
import MagicString from "magic-string";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

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

function replaceEnvironment() {
    return replace({
        preventAssignment: true,
        values: {
            __BRILLIANTSOLE__ENVIRONMENT__: JSON.stringify("__BRILLIANTSOLE__PROD__"),
        },
    });
}

function removeJSDocImports() {
    return {
        transform(code) {
            code = new MagicString(code);

            // removes /** @typedef {import("./SomeModule.js").SomeType} SomeType */ (thanks ChatGPT)
            code.replace(/\/\*\* @typedef \{import\((?:"|')(.*?)("|')\)(?:\.(\w+))?\.(.*?)\} (\w+) \*\//gs, "");

            return {
                code: code.toString(),
                map: code.generateMap(),
            };
        },
    };
}

function removeJSDoc() {
    return {
        transform(code) {
            code = new MagicString(code);

            // removes all jsdocs (thanks chatGPT)
            code.replace(/\/\*\*[\s\S]*?\*\//g, "");

            return {
                code: code.toString(),
                map: code.generateMap(),
            };
        },
    };
}

const _plugins = [header(), removeJSDocImports()];

if (production) {
    _plugins.push(replaceEnvironment());
}

const _browserPlugins = [commonjs(), resolve({ browser: true })];
const lensStudioPlugins = [
    removeJSDoc(),
    resolve(),
    commonjs(),
    babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
    }),
];

const name = "BS";
const input = "src/BS.js";

const builds = [
    {
        input,
        plugins: [..._plugins, ..._browserPlugins],
        output: [
            {
                format: "esm",
                file: "build/brilliantsole.module.js",
            },
        ],
    },
    {
        input,
        plugins: [..._plugins, ..._browserPlugins, terser()],
        output: [
            {
                format: "esm",
                file: "build/brilliantsole.module.min.js",
            },
        ],
    },

    {
        input,
        plugins: [..._plugins, ..._browserPlugins],
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
        plugins: [..._plugins, ..._browserPlugins, terser()],
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
        plugins: [..._plugins],
        external: ["webbluetooth", "debounce"],
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
        plugins: [..._plugins, ...lensStudioPlugins],
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
