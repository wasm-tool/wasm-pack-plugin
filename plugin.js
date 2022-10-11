const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const commandExistsSync = require('command-exists').sync
const chalk = require('chalk')
const Watchpack = require('watchpack')
const which = require('which')
const { homedir } = require('os')

const error = (msg) => console.error(chalk.bold.red(msg))
let info = (msg) => console.log(chalk.bold.blue(msg))

function findWasmPack() {
    // https://github.com/wasm-tool/wasm-pack-plugin/issues/58
    if (process.env['WASM_PACK_PATH'] !== undefined) {
        return process.env['WASM_PACK_PATH']
    }

    const inPath = which.sync('wasm-pack', { nothrow: true })
    if (inPath) {
        return inPath
    }

    const inCargo = path.join(homedir(), '.cargo', 'bin', 'wasm-pack')
    if (fs.existsSync(inCargo)) {
        return inCargo
    }
}

class WasmPackPlugin {
    constructor(options) {
        /**
         * In some cases Webpack will require the pkg entrypoint before it actually
         * exists. To mitigate that we are forcing a first compilation.
         *
         * See https://github.com/wasm-tool/wasm-pack-plugin/issues/15
         */
        this._ranInitialCompilation = false
        this.crateDirectory = options.crateDirectory
        this.forceWatch = options.forceWatch
        this.forceMode = options.forceMode
        this.args = (options.args || '--verbose')
            .trim()
            .split(' ')
            .filter((x) => x)
        this.extraArgs = (options.extraArgs || '')
            .trim()
            .split(' ')
            .filter((x) => x)
        this.outDir = options.outDir || 'pkg'
        this.outName = options.outName || 'index'
        this.watchDirectories = (options.watchDirectories || []).concat(
            path.resolve(this.crateDirectory, 'src')
        )
        this.watchFiles = [path.resolve(this.crateDirectory, 'Cargo.toml')]

        if (options.pluginLogLevel && options.pluginLogLevel !== 'info') {
            // The default value for pluginLogLevel is 'info'. If specified and it's
            // not 'info', don't log informational messages. If unspecified or 'info',
            // log as per usual.
            info = () => {}
        }

        this.wp = new Watchpack()
        this.isDebug = true
        this.error = null
    }

    apply(compiler) {
        this.isDebug = this.forceMode
            ? this.forceMode === 'development'
            : compiler.options.mode === 'development'

        // This fixes an error in Webpack where it cannot find
        // the `pkg/index.js` file if Rust compilation errors.
        this._makeEmpty()

        // force first compilation
        compiler.hooks.beforeCompile.tapPromise('WasmPackPlugin', () => {
            if (this._ranInitialCompilation === true) {
                return Promise.resolve()
            }

            this._ranInitialCompilation = true

            return this._checkWasmPack().then(() => {
                const shouldWatch =
                    this.forceWatch ||
                    (this.forceWatch === undefined && compiler.watchMode)

                if (shouldWatch) {
                    this.wp.watch({
                        files: this.watchFiles,
                        directories: this.watchDirectories,
                        startTime: Date.now() - 10000,
                    })

                    this.wp.on('aggregated', () => {
                        this._compile(true)
                    })
                }

                return this._compile(false)
            })
        })

        let first = true

        compiler.hooks.thisCompilation.tap('WasmPackPlugin', (compilation) => {
            // Super hacky, needed to workaround a bug in Webpack which causes
            // thisCompilation to be triggered twice on the first compilation.
            if (first) {
                first = false
            } else {
                // This is needed in order to gracefully handle errors in Webpack,
                // since Webpack has its own custom error system.
                if (this.error != null) {
                    compilation.errors.push(this.error)
                }
            }
        })
    }

    _makeEmpty() {
        try {
            fs.mkdirSync(this.outDir, {recursive: true})
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e
            }
        }

        fs.writeFileSync(path.join(this.outDir, this.outName + '.js'), '')
    }

    async _checkWasmPack() {
        info('🧐  Checking for wasm-pack...\n')

        const bin = findWasmPack()
        if (bin) {
            info('✅  wasm-pack is installed at ' + bin + '. \n')
            return true
        }

        info('ℹ️  Installing wasm-pack \n')

        if (commandExistsSync('npm')) {
            return runProcess('npm', ['install', '-g', 'wasm-pack'], {stdio: ['ignore', 'inherit', 'inherit']}).catch(e => {
                error(
                    '⚠️ could not install wasm-pack globally when using npm, you must have permission to do this'
                )
                throw e
            })
        } else if (commandExistsSync('yarn')) {
            return runProcess('yarn', ['global', 'add', 'wasm-pack'], {stdio: ['ignore', 'inherit', 'inherit']}).catch(e => {
                error(
                    '⚠️ could not install wasm-pack globally when using yarn, you must have permission to do this'
                )
                throw e
            })
        } else {
            error(
                '⚠️ could not install wasm-pack, you must have yarn or npm installed'
            )
        }
        return false
    }

    _compile(watching) {
        info(
            `ℹ️  Compiling your crate in ${
                this.isDebug ? 'development' : 'release'
            } mode...\n`
        )

        return fs.promises
            .stat(this.crateDirectory)
            .then((stats) => {
                if (!stats.isDirectory()) {
                    throw new Error(`${this.crateDirectory} is not a directory`)
                }
            })
            .then(() => {
                return spawnWasmPack({
                    outDir: this.outDir,
                    outName: this.outName,
                    isDebug: this.isDebug,
                    cwd: this.crateDirectory,
                    args: this.args,
                    extraArgs: this.extraArgs,
                })
            })
            .then((detail) => {
                // This clears out the error when the compilation succeeds.
                this.error = null

                if (detail) {
                    info(detail)
                }

                info('✅  Your crate has been correctly compiled\n')
            })
            .catch((e) => {
                // Webpack has a custom error system, so we cannot return an
                // error directly, instead we need to trigger it later.
                this.error = e

                if (watching) {
                    // This is to trigger a recompilation so it displays the error message
                    this._makeEmpty()
                }
            })
    }
}

function spawnWasmPack({ outDir, outName, isDebug, cwd, args, extraArgs }) {
    const bin = findWasmPack()

    const allArgs = [
        ...args,
        'build',
        '--out-dir',
        outDir,
        '--out-name',
        outName,
        ...(isDebug ? ['--dev'] : []),
        ...extraArgs,
    ]

    const options = {
        cwd,
        stdio: 'inherit',
    }

    return runProcess(bin, allArgs, options)
}

function runProcess(bin, args, options) {
    return new Promise((resolve, reject) => {
        const p = spawn(bin, args, options)

        p.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error('Rust compilation.'))
            }
        })

        p.on('error', reject)
    })
}

module.exports = WasmPackPlugin
