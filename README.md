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

  module: {
    rules: [
      {
        test: /Cargo.toml$/,
        loader: "@wasm-tool/wasm-pack-plugin"
      }
    ]
  },

  // ...
};
```

and then import your crate:

```js
import("./path/to/your/Cargo.toml").then(module => {
  module.run();
});
```
