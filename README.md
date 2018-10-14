# @wasm-tool/wasm-pack-plugin

> Webpack plugin for Rust

## Installation

```sh
yarn add --dev @wasm-tool/wasm-pack-plugin
```

### Rust lang

Rust >= `rustc 1.31.0-nightly` is required to fetch and compile rust wasm. Rust is installed and managed using [`rustup`](https://rustup.rs/)

### `wasm-pack`

We expect `wasm-pack` to be in your `$PATH`. See [installation here](https://github.com/rustwasm/wasm-pack/blob/master/docs/src/setup.md#installing-wasm-pack).

### `wasm-bindgen-cli`

`wasm-bindgen` is a build requirement for `wasm-pack` and a dependency of `wasm-bindgen-cli`. To verify installation, run:

```
which wasm-bindgen
```

If a path is not returned, install `wasm-bindgen-cli` using the cargo package manager:

```
cargo +nightly install wasm-bindgen-cli
```

Following installation, you may be prompted to upgrade the `wasm-bindgen` dependency. This can be done using the following:

```
cargo update -p wasm-bindgen
```

## Usage

Add the loader in your `webpack.config.js`:

```js
module.exports = {
  // ...

  plugins: [

    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "crate"),
      withTypeScript: true
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
