import { Plugin } from 'webpack';

declare module '@wasm-tool/wasm-pack-plugin' {
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
}
