import type { CompilerOptions } from 'typescript';
interface ConfigOptions {
    compilerOptions?: CompilerOptions;
    exclude?: string[];
    extends?: string;
    files?: string[];
    include?: string[];
    references?: string[];
}
declare const BASE_CONFIG: {
    readonly compilerOptions: {
        readonly allowJs: true;
        readonly baseUrl: "src";
        readonly declaration: false;
        readonly esModuleInterop: true;
        readonly isolatedModules: true;
        readonly lib: readonly ["ESNext"];
        readonly module: "NodeNext";
        readonly moduleDetection: "force";
        readonly moduleResolution: "NodeNext";
        readonly noFallthroughCasesInSwitch: true;
        readonly noImplicitAny: true;
        readonly noImplicitOverride: true;
        readonly noUncheckedIndexedAccess: true;
        readonly resolveJsonModule: true;
        readonly skipLibCheck: true;
        readonly sourceMap: true;
        readonly strict: true;
        readonly strictNullChecks: true;
        readonly inlineSources: true;
        readonly target: "ES2015";
        readonly verbatimModuleSyntax: true;
        readonly types: readonly ["node"];
    };
    readonly exclude: readonly ["node_modules"];
};
type MergeOptions<Options extends ConfigOptions> = typeof BASE_CONFIG & Options & {
    compilerOptions: typeof BASE_CONFIG.compilerOptions & Options['compilerOptions'];
};
export declare function createConfig<const Options extends ConfigOptions>(options: Options): MergeOptions<Options>;
export {};
