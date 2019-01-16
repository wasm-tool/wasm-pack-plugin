# @wasm-tool/wasm-pack-plugin

> Webpack plugin for Rust

## Installation

```sh
yarn add --dev @wasm-tool/wasm-pack-plugin
```

### `wasm-pack`

We expect `wasm-pack` to be in your `$PATH`. See [installation here](https://github.com/rustwasm/wasm-pack/blob/master/docs/src/setup.md#installing-wasm-pack).

## Usage

Add the loader in your `webpack.config.js`:

```js
module.exports = {
  // ...

  plugins: [

    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "crate"),

      // List of directories changes to which will trigger the build.
      //
      // If omitted, only the crate's `src/` directory will be monitored for
      // changes. Otherwise this should be an array of absolute paths.
      watchDirectories: [
        path.resolve(__dirname, "crate/src"),
        path.resolve(__dirname, "another-crate/src")
      ],

      // Check https://rustwasm.github.io/wasm-pack/book/commands/build.html for
      // the available set of arguments.
      //
      // Default arguments are `--typescript --target browser --mode normal`.
      extraArgs: "--no-typescript",

      // If defined, `forceWatch` will force activate/deactivate watch mode for
      // `.rs` files.
      //
      // The default (not set) aligns watch mode for `.rs` files to Webpack's
      // watch mode.
      // forceWatch: true,

      // If defined, `forceMode` will force the compilation mode for `wasm-pack`
      //
      // Possible values are `development` and `production`.
      //
      // the mode `development` makes `wasm-pack` build in `debug` mode.
      // the mode `production` makes `wasm-pack` build in `release` mode.
      // forceMode: "development",
    }),

  ]

  // ...
};
```

and then import your `pkg` folder from `wasm-pack`:

```js
import("./path/to/your/pkg").then(module => {
  module.run();
});
```
