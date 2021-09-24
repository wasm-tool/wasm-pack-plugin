import { Compiler } from 'webpack'

export interface WasmPackPluginOptions {
    crateDirectory: string
    args?: string
    extraArgs?: string
    forceWatch?: boolean
    forceMode?: 'development' | 'production'
    outDir?: string
    outName?: string
    watchDirectories?: string[]
    /** Controls plugin output verbosity. Defaults to 'info'. */
    pluginLogLevel?: 'info' | 'error'
}

export default class WasmPackPlugin {
    constructor(options: WasmPackPluginOptions)

    /** Invocation point for webpack plugins. */
    apply(compiler: Compiler): void
}

export = WasmPackPlugin

declare module '@wasm-tool/wasm-pack-plugin' {
    export { WasmPackPluginOptions, WasmPackPlugin }
    export default WasmPackPlugin
    export = WasmPackPlugin
}
