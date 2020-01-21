import { Plugin } from 'webpack';

declare module '@wasm-tool/wasm-pack-plugin' {
    export interface WasmPackPluginOptions {
        crateDirectory: string;
        extraArgs?: string;
        forceWatch?: boolean;
        forceMode?: 'development' | 'production';
        outDir?: string;
        outName?: string;
        watchDirectories?: string[];
    }

    export default class WasmPackPlugin extends Plugin {
        constructor(options: WasmPackPluginOptions)
    }
}
