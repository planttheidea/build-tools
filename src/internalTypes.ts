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

export interface ExportDefinition {
  types: string;
  default: string;
}

export interface ExportDefinitionTier {
  import: ExportDefinition;
  require?: ExportDefinition;
  default?: ExportDefinition;
}

export interface PackageJson {
  [key: string]: any;

  author?: string;
  browser?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  exports: Record<string, ExportDefinition | ExportDefinitionTier>;
  main: string;
  module?: string;
  name: string;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  type?: string;
  types?: string;
  version: string;
}
