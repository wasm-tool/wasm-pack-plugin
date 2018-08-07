const { spawn } = require('child_process');
const { join, dirname } = require('path');
const Watchpack = require('watchpack');
const glob = require("glob");

class WasmPackPlugin {
  constructor(options) {
    this.crateDirectory = options.crateDirectory;

    this.wp = new Watchpack();
  }

  apply(compiler) {
    this._compile(); // force first compilation

    const files = glob.sync(join(this.crateDirectory, '**', '*.rs'));

    this.wp.watch(files, [], Date.now() - 10000);
    this.wp.on('change', this._compile.bind(this));
  }

  _compile() {
    console.log('ℹ️  Compiling your crate...\n');

    spawnWasmPack({
      isDebug: true,
      cwd: this.crateDirectory
    })
      .then(this._compilationSuccess)
      .catch(this._compilationFailure);
  }

  _compilationSuccess(info) {
    if (info) {
      console.log(info);
    }

    console.log('✅  Your crate has been correctly compiled\n');
  }

  _compilationFailure(err) {
    throw err;
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
