# @wasm-tool/rust-loader

> Webpack loader for Rust

## Installation

```sh
yarn add --dev @wasm-tool/rust-loader
```

### `wasm-pack`

We expect `wasm-pack` to be in your `$PATH`. See [installation here]
(https://github.com/rustwasm/wasm-pack/blob/master/docs/src/setup.md#installing-wasm-pack).

## Usage

Add the loader in your `webpack.config.js`:

```js
module.exports = {
  // ...

  module: {
    rules: [
      {
        test: /Cargo.toml$/,
        loader: "@wasm-tool/rust-loader"
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
