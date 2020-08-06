import { Plugin } from 'webpack';

export interface WasmPackPluginOptions {
    crateDirectory: string;
    args?: string;
    extraArgs?: string;
    forceWatch?: boolean;
    forceMode?: 'development' | 'production';
    outDir?: string;
    outName?: string;
    watchDirectories?: string[];
    /** Controls plugin output verbosity. Defaults to 'info'. */
    pluginLogLevel?: 'info' | 'error';
}

export default class WasmPackPlugin extends Plugin {
    constructor(options: WasmPackPluginOptions)
}

export = WasmPackPlugin

declare module '@wasm-tool/wasm-pack-plugin' {
    export { WasmPackPluginOptions, WasmPackPlugin }
    export default WasmPackPlugin
    export = WasmPackPlugin
}
