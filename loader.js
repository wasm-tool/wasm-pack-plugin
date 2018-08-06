const { spawn } = require('child_process');
const { join, dirname } = require('path');

function spawnWasmPack({ isDebug, cwd }) {
  const bin = 'wasm-pack';

  const args = [
    '--verbose',
    'build',
    '--target', 'browser',
    '--mode', 'no-install',
    ...(isDebug ? ['--debug'] : []),
    // usage is unknown, ignore for now
    '--no-typescript'
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
  this.cacheable();
  const callback = this.async();

  const cwd = dirname(this.resourcePath);
  const pkgDir = join(cwd, './pkg');

  console.log('ℹ️  Compiling your crate...\n');

  spawnWasmPack({
    isDebug: this.debug,
    cwd
  })
    .then(info => {
      if (info) {
        console.log(info);
      }
      console.log('✅  Your crate has been correctly compiled\n');
      const pkg = require(join(pkgDir, './package.json'));
      const exportPath = join(pkgDir, pkg.main).replace(/\\/g, '/');
      const wrapper = `
        export * from "${exportPath}";
      `;
      callback(null, wrapper);
    })
    .catch(callback);
};

module.exports.raw = true;
