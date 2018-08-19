const { spawn } = require('child_process');
const { join, dirname } = require('path');
const { writeFileSync, mkdirSync, existsSync, unlinkSync } = require('fs');
const chalk = require('chalk');
const Watchpack = require('watchpack');
const glob = require('glob');

const error = msg => console.log(chalk.bold.red(msg));
const info = msg => console.log(chalk.bold.blue(msg));

/**
 * In some cases Webpack will require the pkg entrypoint before it actually
 * exists. To mitigate that we are forcing a first compilation.
 *
 * See https://github.com/wasm-tool/wasm-pack-plugin/issues/15
 */
let ranInitialCompilation = false;

class WasmPackPlugin {
  constructor(options) {
    this.crateDirectory = options.crateDirectory;

    this.wp = new Watchpack();
  }

  apply(compiler) {

    // force first compilation
    compiler.hooks.beforeCompile.tapPromise('WasmPackPlugin', () => {
      if (ranInitialCompilation === true) {
        return Promise.resolve();
      }

      ranInitialCompilation = true;

      return this._compile();
    });

    const files = glob.sync(join(this.crateDirectory, '**', '*.rs'));

    this.wp.watch(files, [], Date.now() - 10000);
    this.wp.on('change', this._compile.bind(this));
  }

  _compile() {
    info('ℹ️  Compiling your crate...\n');

    return spawnWasmPack({
      isDebug: true,
      cwd: this.crateDirectory
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

function spawnWasmPack({ isDebug, cwd }) {
  const bin = 'wasm-pack';

  const args = [
    '--verbose',
    'build',
    '--target', 'browser',
    '--mode', 'no-install',
    ...(isDebug ? ['--debug'] : []),
    '--no-typescript' // usage is unknown, ignore for now
  ];

  const options = {
    cwd,
    env: {
      PATH: process.env['PATH']
    }
  };

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
  });
}

module.exports = function() {
};

module.exports = WasmPackPlugin;
