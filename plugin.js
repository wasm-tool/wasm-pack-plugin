const {
  spawn
} = require('child_process');
const path = require('path');
const commandExistsSync = require('command-exists').sync;
const chalk = require('chalk');
const Watchpack = require('watchpack');

const error = msg => console.log(chalk.bold.red(msg));
const info = msg => console.log(chalk.bold.blue(msg));
// https://github.com/wasm-tool/wasm-pack-plugin/issues/58
const wasmPackPath = process.env["WASM_PACK_PATH"];

class WasmPackPlugin {
  constructor(options) {
    /**
     * In some cases Webpack will require the pkg entrypoint before it actually
     * exists. To mitigate that we are forcing a first compilation.
     *
     * See https://github.com/wasm-tool/wasm-pack-plugin/issues/15
     */
    this._ranInitialCompilation = false;
    this.crateDirectory = options.crateDirectory;
    this.forceWatch = options.forceWatch;
    this.forceMode = options.forceMode;
    this.extraArgs = (options.extraArgs || '').trim().split(' ').filter(x=> x);
    this.watchDirectories = (options.watchDirectories || [])
      .concat(path.resolve(this.crateDirectory, 'src'));

    this.wp = new Watchpack();
    this.isDebug = true;
  }

  apply(compiler) {
    this.isDebug = this.forceMode ? this.forceMode === "development" : compiler.options.mode === "development";

    // force first compilation
    compiler.hooks.beforeCompile.tapPromise('WasmPackPlugin', () => {
      if (this._ranInitialCompilation === true) {
        return Promise.resolve();
      }

      this._ranInitialCompilation = true;

      return this._checkWasmPack()
        .then(() => {
            if (this.forceWatch || (this.forceWatch === undefined && compiler.watchMode)) {
              this.wp.watch([], this.watchDirectories, Date.now() - 10000);
              this.wp.on('change', this._compile.bind(this));
            }
            return this._compile();
        })
        .catch(this._compilationFailure);
    });
  }

  _checkWasmPack() {
    info('🧐  Checking for wasm-pack...\n');

    if (wasmPackPath !== undefined) {
      info('✅  wasm-pack is installed; managed by another tool. \n');
      return Promise.resolve();
    } else if (commandExistsSync('wasm-pack')) {
      info('✅  wasm-pack is installed. \n');

      return Promise.resolve();
    } else {
      info('ℹ️  Installing wasm-pack \n');

      return runProcess('cargo', ['install', 'wasm-pack'], {});
    }
  }

  _compile() {
    info(`ℹ️  Compiling your crate in ${this.isDebug ? 'development' : 'release'} mode...\n`);

    return spawnWasmPack({
        isDebug: this.isDebug,
        cwd: this.crateDirectory,
        extraArgs: this.extraArgs,
      })
      .then(this._compilationSuccess)
      .catch(this._compilationFailure);
  }

  _compilationSuccess(detail) {
    if (detail) {
      info(detail);
    }

    info('✅  Your crate has been correctly compiled\n');
  }

  _compilationFailure(err) {
    error('wasm-pack error: ' + err);
  }
}

function spawnWasmPack({
  isDebug,
  cwd,
  extraArgs
}) {
  const bin = wasmPackPath || 'wasm-pack';

  const args = [
    '--verbose',
    'build',
    ...(isDebug ? ['--dev'] : []),
    ...extraArgs,
  ];

  const options = {
    cwd
  };

  return runProcess(bin, args, options);
}

function runProcess(bin, args, options) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, options);

    let stdout = '';
    let stderr = '';

    p.stdout.on('data', d => {
      stdout += d;
    });

    p.stderr.on('data', d => {
      stderr += d;
    });

    p.on('close', code => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(stderr);
      }
    });

    p.on('error', reject);
  });
}

module.exports = WasmPackPlugin;
