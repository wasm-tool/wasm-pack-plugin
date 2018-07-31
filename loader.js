const { execSync } = require('child_process');
const { spawn } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

const pkgDir = join(process.cwd(), './pkg');

function spawnWasmPack(isDebug) {
  const bin = 'wasm-pack';

  const args = [
    '--verbose',
    'build',
    '--target', 'browser',
    '--mode', 'no-install',

    ...(isDebug ? [ '--debug' ] : []),

    // usage is unknown, ignore for now
    '--no-typescript'
  ];

  return new Promise((resolve, reject) => {
    const p = spawn(bin, args);

    let stdout = '';
    let stderr = '';

    p.stdout.on('data', (d) => {
      stdout += d;
    });

    p.stderr.on('data', (d) => {
      stderr += d;
    });

    p.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(stderr);
      }
    });
  });
}

module.exports = function() {
  this.cacheable();
  const callback = this.async();

  spawnWasmPack(this.debug)
    .then(() => {
      const pkg = require(join(pkgDir, "./package.json"));

      const wrapper = `
        export * from "${pkgDir}/${pkg.main}";
      `;

      callback(null, wrapper);
    })
    .catch(callback);
}

module.exports.raw = true;
