import terser from "@rollup/plugin-terser";
import MagicString from "magic-string";
import replace from "@rollup/plugin-replace";

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

const builds = [
    {
        input: "src/BrilliantSole.js",
        plugins: [replaceEnvironment(), header()],
        output: [
            {
                format: "esm",
                file: "build/brilliantsole.module.js",
            },
        ],
    },
    {
        input: "src/BrilliantSole.js",
        plugins: [replaceEnvironment(), header(), terser()],
        output: [
            {
                format: "esm",
                file: "build/brilliantsole.module.min.js",
            },
        ],
    },
    {
        input: "src/BrilliantSole.js",
        plugins: [replaceEnvironment(), header()],
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
        plugins: [replaceEnvironment(), header(), terser()],
        output: [
            {
                format: "umd",
                name: "BrilliantSole",
                file: "build/brilliantsole.min.js",
            },
        ],
    },
];

export default builds;
