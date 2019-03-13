import { Plugin } from 'webpack';

declare module '@wasm-tool/wasm-pack-plugin' {
    export interface WasmPackPluginOptions {
        crateDirectory: string;
        extraArgs?: string;
        watchDirectories?: string[];
        forceWatch?: boolean;
        forceMode?: 'development' | 'production';
    }

    export default class WasmPackPlugin extends Plugin {
        constructor(options: WasmPackPluginOptions)
    }
}
