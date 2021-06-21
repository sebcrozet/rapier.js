const CreateFileWebpack = require("create-file-webpack");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

function matchOtherDimRegex({is2d}) {
    if (is2d) {
        return /^ *\/\/ *#if +DIM3[\s\S]*?(?=#endif)#endif/gm;
    } else {
        return /^ *\/\/ *#if +DIM2[\s\S]*?(?=#endif)#endif/gm;
    }
}

function initCode({is2d}) {
    let dim = is2d ? "2d" : "3d";

    return `
// @ts-ignore
import wasmBase64 from "./rapier_wasm${dim}_bg.wasm";
import wasmInit from "./rapier_wasm${dim}";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export async function init() {
    await wasmInit(wasmBase64);
}`;
}

function copyAndReplace({is2d}) {
    let dim = is2d ? "2d" : "3d";

    return {
        mode: "production",
        entry: {},
        plugins: [
            new CopyPlugin({
                patterns: [
                    // copy src.ts into pkg for compiling,
                    // remove sections wrapped in #ifdef DIMx ... #endif
                    // add init() function to rapier.ts
                    {
                        from: path.resolve(__dirname, "../src.ts"),
                        to: path.resolve(__dirname, `./pkg${dim}/src/`),
                        transform(content, filepath) {
                            let result = content
                                .toString()
                                .replace(matchOtherDimRegex({is2d}), "");

                            if (filepath.endsWith(path.sep + "rapier.ts")) {
                                result += initCode({is2d});
                            }
                            return result;
                        },
                        filter: (path) => !path.endsWith("raw.ts"),
                    },
                    {
                        context: path.resolve(__dirname, `../rapier${dim}/pkg/`),
                        from: 'rapier_wasm*',
                        to: path.resolve(__dirname, `./pkg${dim}/src/`),
                    },
                    // copy package.json, adapting entries, LICENSE and README.md
                    {
                        from: path.resolve(__dirname, `../rapier${dim}/pkg/package.json`),
                        to: path.resolve(__dirname, `./pkg${dim}/package.json`),
                        transform(content) {
                            let config = JSON.parse(content.toString());
                            config.name = `@dimforge/rapier${dim}-module`;
                            config.description += " esmodule for buildless use in modern browsers";
                            config.types = "dist/rapier.d.ts";
                            config.main = "dist/rapier.js";
                            config.type = "module",
                            config.files = ["*"];
                            delete config.module;

                            return JSON.stringify(config, undefined, 2);
                        },
                    },
                    {
                        from: path.resolve(__dirname, `../rapier${dim}/pkg/LICENSE`),
                        to: path.resolve(__dirname, `./pkg${dim}`),
                    },
                    {
                        from: path.resolve(__dirname, `../rapier${dim}/pkg/README.md`),
                        to: path.resolve(__dirname, `./pkg${dim}/README.md`),
                    },
                    {
                        from: path.resolve(__dirname, `./tsconfig.json`),
                        to: path.resolve(__dirname, `./pkg${dim}/`),
                    },
                ],
            }),
            // ts files import from raw.ts, create the file reexporting the wasm-bindgen exports.
            // the indirection simplifies switching between 2d and 3d
            new CreateFileWebpack({
                path: path.resolve(__dirname, `./pkg${dim}/src/`),
                fileName: "raw.ts",
                content: `export * from "./rapier_wasm${dim}.js"`,
            })
        ],
    };
}

function compile({is2d}) {
    let dim = is2d ? "2d" : "3d";

    return {
        mode: "production",
        entry: `./pkg${dim}/src/rapier.ts`,
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.wasm$/,
                    type: 'asset/inline'
                },
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                },
            ],
        },
        plugins: [
            // create a thin wrapper class to avoid having to call RAPIER.init
            new CreateFileWebpack({
                path: path.resolve(__dirname, `./pkg${dim}/dist/`),
                fileName: "rapier.js",
                content: `
import * as RAPIER from "./rapier_async.js";
await RAPIER.init();
export default RAPIER;`,
            })
        ],
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
        output: {
            filename: "rapier_async.js",
            enabledChunkLoadingTypes: ["import-scripts"],
            chunkLoading: "import-scripts",
            wasmLoading: "fetch",
            path: path.resolve(__dirname, `pkg${dim}`, 'dist'),
            library: {
                type: "module"
            }
        },
        experiments:{
            asyncWebAssembly: true,
            outputModule: true,
            topLevelAwait: true,
        }
    };
}

// Webpack doesn't really handle files that are both inputs and outputs. Instead, run
// webpack twice, once to genrate the source, and once to compile it.
module.exports = env => env.phase === "1" ? [
    // 2d
    copyAndReplace({is2d: true}),

    // 3d
    copyAndReplace({is2d: false}),
] : [
    // 2d
    compile({is2d: true}),

    // 3d
    compile({is2d: false}),
];
