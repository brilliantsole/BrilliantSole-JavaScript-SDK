import terser from "@rollup/plugin-terser";
import MagicString from "magic-string";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

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

const _plugins = [replaceEnvironment(), header()];

const builds = [
    {
        input: "src/BrilliantSole.js",
        plugins: [..._plugins],
        output: [
            {
                format: "esm",
                file: "build/brilliantsole.module.js",
            },
        ],
    },
    {
        input: "src/BrilliantSole.js",
        plugins: [..._plugins, terser()],
        output: [
            {
                format: "esm",
                file: "build/brilliantsole.module.min.js",
            },
        ],
    },

    {
        input: "src/BrilliantSole.js",
        plugins: [..._plugins],
        output: [
            {
                format: "umd",
                name: "BrilliantSole",
                file: "build/brilliantsole.js",
                indent: "\t",
            },
        ],
    },
    {
        input: "src/BrilliantSole.js",
        plugins: [..._plugins, terser()],
        output: [
            {
                format: "umd",
                name: "BrilliantSole",
                file: "build/brilliantsole.min.js",
            },
        ],
    },

    {
        input: "src/BrilliantSole.js",
        plugins: [..._plugins],
        external: ["webbluetooth"],
        output: [
            {
                format: "cjs",
                name: "BrilliantSole",
                file: "build/brilliantsole.cjs",
            },
        ],
    },
];

export default builds;
