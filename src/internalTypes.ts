export interface StandardConfigOptions {
  cjs: boolean;
  config: string;
  development: string;
  library: string;
  react: boolean;
  source: string;
  sourceMap: boolean;
  umd: boolean;
}

export interface PackageJsonDevEnginesMeta {
  name: string;
  onFail?: 'error' | 'ignore' | 'warn';
  version?: string;
}

export interface PackageExportDefinition {
  types: string;
  default: string;
}

export interface PackageExportDefinitionTier {
  import: PackageExportDefinition;
  require?: PackageExportDefinition;
  default?: PackageExportDefinition;
}

export interface PackagePublishConfig {
  access: null | 'public' | 'restricted';
  registry?: string;
  tag?: string;
}

export interface PackageFunding {
  type: string;
  url: string;
}

interface BasePackageJson {
  [key: string]: any;

  author: {
    email: string;
    name: string;
    url: string;
  };
  bin?: Record<string, string>;
  browser?: string;
  bundledDependencies?: string[];
  config?: Record<string, any>;
  contributors?: string[];
  cpu?: string[];
  dependencies?: Record<string, string>;
  description?: string;
  devDependencies: Record<string, string>;
  devEngines?: {
    cpu?: PackageJsonDevEnginesMeta | PackageJsonDevEnginesMeta[];
    libc?: PackageJsonDevEnginesMeta | PackageJsonDevEnginesMeta[];
    os?: PackageJsonDevEnginesMeta | PackageJsonDevEnginesMeta[];
    packageManager?: PackageJsonDevEnginesMeta | PackageJsonDevEnginesMeta[];
    runtime?: PackageJsonDevEnginesMeta | PackageJsonDevEnginesMeta[];
  };
  directories?: {
    bin?: string;
    doc?: string;
    example?: string;
    lib?: string;
    man?: string;
    test?: string;
  };
  engines?: Record<string, string>;
  exports: Record<string, PackageExportDefinition | PackageExportDefinitionTier>;
  files: string[];
  funding?: string | PackageFunding | PackageFunding[];
  keywords?: string[];
  homepage?: string;
  license: string;
  main: string;
  man?: string;
  module: string;
  name: string;
  os?: string[];
  optionalDependencies?: Record<string, string>;
  overrides?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional: boolean }>;
  publishConfig: PackagePublishConfig;
  private?: boolean;
  repository: {
    directory?: string;
    type: 'git';
    url: string;
  };
  scripts: Record<string, string>;
  type: string;
  types: string;
  workspaces?: string[];
  version: string;
}

interface PrivatePackageJson extends BasePackageJson {
  publishConfig: {
    access: null | 'restricted';
  };
  private: true;
}

interface PublicPackageJson extends BasePackageJson {
  publishConfig: {
    access: 'public';
  };
  private?: false;
}

export type PackageJson = PrivatePackageJson | PublicPackageJson;
