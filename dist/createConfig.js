const BASE_CONFIG = {
    compilerOptions: {
        allowJs: true,
        baseUrl: 'src',
        declaration: false,
        esModuleInterop: true,
        isolatedModules: true,
        lib: ['ESNext'],
        module: 'NodeNext',
        moduleDetection: 'force',
        moduleResolution: 'NodeNext',
        noFallthroughCasesInSwitch: true,
        noImplicitAny: true,
        noImplicitOverride: true,
        noUncheckedIndexedAccess: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        sourceMap: true,
        strict: true,
        strictNullChecks: true,
        inlineSources: true,
        target: 'ES2015',
        verbatimModuleSyntax: true,
        types: ['node'],
    },
    exclude: ['node_modules'],
};
export function createConfig(options) {
    return Object.assign(Object.assign(Object.assign({}, BASE_CONFIG), options), { compilerOptions: Object.assign(Object.assign({}, BASE_CONFIG.compilerOptions), options.compilerOptions) });
}
//# sourceMappingURL=createConfig.js.map