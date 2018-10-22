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
      // check https://rustwasm.github.io/wasm-pack/book/commands/build.html for extraArgs
      // defautls --typescript --target browser --mode normal
      extraArgs: "--no-typescript --mode no-install",
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
