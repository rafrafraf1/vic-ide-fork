declare module "nyc" {
  interface Config {
    tempDirectory?: string;
    cache?: boolean;
    cwd?: string;
    exclude?: string | string[];
    sourceMap?: boolean;
    hookRequire?: boolean;
    hookRunInContext?: boolean;
    hookRunInThisContext?: boolean;
    reporter?: string[];
  }

  class NYC {
    constructor(config: Config);
    wrap(): void;
    createTempDirectory(): Promise<void>;
    writeCoverageFile(): Promise<void>;
    getCoverageMapFromAllCoverageFiles(baseDirectory: string): Promise<object>;
    report(): Promise<void>;
  }

  namespace NYC {}

  export = NYC;
}
