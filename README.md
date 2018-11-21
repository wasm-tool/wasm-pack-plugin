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

      // Check https://rustwasm.github.io/wasm-pack/book/commands/build.html for
      // the available set of arguments.
      //
      // Default arguments are `--typescript --target browser --mode normal`.
      extraArgs: "--no-typescript",

      // If enabled, `watch` will always compile changes in `.rs` files, even
      // if Webpack is not running in watch mode. Conversely, changing this to
      // `false` will disable watch mode, even if Webpack is running in watch
      // mode.
      watch: true,
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
