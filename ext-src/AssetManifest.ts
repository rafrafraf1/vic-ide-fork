export class AssetManifest {
  static load(fileContents: string): AssetManifest | string {
    let json: unknown;
    try {
      json = JSON.parse(fileContents);
    } catch (err: unknown) {
      return `Error parsing JSON: ${err as string}`;
    }
    if (Array.isArray(json)) {
      return `Expected JSON object, got array: ${json as unknown as string}`;
    }
    if (typeof json !== "object" || json === null) {
      return `Error parsing JSON: ${json as string}`;
    }
    const files = AssetManifest.loadFiles(json);
    if (typeof files === "string") {
      return files;
    }
    const entrypoints = AssetManifest.loadEntrypoints(json);
    if (typeof entrypoints === "string") {
      return entrypoints;
    }
    return new AssetManifest(files, entrypoints);
  }

  private static loadFiles(json: object): Map<string, string> | string {
    const result = new Map<string, string>();
    if (!("files" in json)) {
      return 'Missing key: "files"';
    }
    const files = json.files;
    if (files === null || typeof files !== "object" || Array.isArray(files)) {
      return `Invalid value for "files": ${files as string}`;
    }
    for (const key of Object.keys(files)) {
      const value: unknown = files[key];
      if (typeof value !== "string") {
        return `Invalid value for key "${key}": ${value as string}`;
      }
      result.set(key, value);
    }
    return result;
  }

  private static loadEntrypoints(json: object): string[] | string {
    const result: string[] = [];
    if (!("entrypoints" in json)) {
      return 'Missing key: "entrypoints"';
    }
    if (!Array.isArray(json.entrypoints)) {
      return `Invalid value for "entrypoints": ${json.entrypoints as string}`;
    }
    for (const entrypoint of json.entrypoints) {
      if (typeof entrypoint !== "string") {
        return `Invalid "entrypoint": ${entrypoint as string}`;
      }
      result.push(entrypoint);
    }
    return result;
  }

  private constructor(
    private files: Map<string, string>,
    private entrypoints: string[]
  ) {
    // Nothing
  }

  public getFile(file: string): string | null {
    const result = this.files.get(file);
    if (result !== undefined) {
      return result;
    } else {
      return null;
    }
  }

  public getEntryPoints(): string[] {
    return this.entrypoints;
  }
}
