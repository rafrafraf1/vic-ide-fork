import type { Result } from "../../src/common/Functional/Result";

export class AssetManifest {
  public constructor(
    private files: Map<string, string>,
    private entrypoints: string[],
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

/**
 * Framework used.
 *
 *   - "cra": create-react-app <https://create-react-app.dev/>
 */
const FRAMEWORK = "vite" as string;

export function loadAssetManifest(
  fileContents: string,
): Result<string, AssetManifest> {
  if (FRAMEWORK === "cra") {
    return loadCraAssetManifest(fileContents);
  } else if (FRAMEWORK === "vite") {
    return loadViteAssetManifest(fileContents);
  } else {
    throw new Error(`Unknown FRAMEWORK: ${FRAMEWORK}`);
  }
}

export function loadCraAssetManifest(
  fileContents: string,
): Result<string, AssetManifest> {
  let json: unknown;
  try {
    json = JSON.parse(fileContents);
  } catch (err: unknown) {
    return {
      kind: "Error",
      error: `Error parsing JSON: ${err as string}`,
    };
  }
  if (Array.isArray(json)) {
    return {
      kind: "Error",
      error: `Expected JSON object, got array: ${json as unknown as string}`,
    };
  }
  if (typeof json !== "object" || json === null) {
    return {
      kind: "Error",
      error: `Error parsing JSON: ${json as string}`,
    };
  }
  const files = loadCraFiles(json);
  if (files.kind === "Error") {
    return files;
  }
  const entrypoints = loadCraEntrypoints(json);
  if (entrypoints.kind === "Error") {
    return entrypoints;
  }
  return {
    kind: "Ok",
    value: new AssetManifest(files.value, entrypoints.value),
  };
}

function loadCraFiles(json: object): Result<string, Map<string, string>> {
  const result = new Map<string, string>();
  if (!("files" in json)) {
    return {
      kind: "Error",
      error: 'Missing key: "files"',
    };
  }
  const files = json.files;
  if (files === null || typeof files !== "object" || Array.isArray(files)) {
    return {
      kind: "Error",
      error: `Invalid value for "files": ${files as string}`,
    };
  }
  for (const key of Object.keys(files)) {
    const value: unknown = files[key as keyof typeof files];
    if (typeof value !== "string") {
      return {
        kind: "Error",
        error: `Invalid value for key "${key}": ${value as string}`,
      };
    }
    result.set(key, value);
  }
  return {
    kind: "Ok",
    value: result,
  };
}

function loadCraEntrypoints(json: object): Result<string, string[]> {
  const result: string[] = [];
  if (!("entrypoints" in json)) {
    return {
      kind: "Error",
      error: 'Missing key: "entrypoints"',
    };
  }
  if (!Array.isArray(json.entrypoints)) {
    return {
      kind: "Error",
      error: `Invalid value for "entrypoints": ${json.entrypoints as string}`,
    };
  }
  for (const entrypoint of json.entrypoints) {
    if (typeof entrypoint !== "string") {
      return {
        kind: "Error",
        error: `Invalid "entrypoint": ${entrypoint as string}`,
      };
    }
    result.push(entrypoint);
  }
  return {
    kind: "Ok",
    value: result,
  };
}

export function loadViteAssetManifest(
  fileContents: string,
): Result<string, AssetManifest> {
  let json: unknown;
  try {
    json = JSON.parse(fileContents);
  } catch (err: unknown) {
    return {
      kind: "Error",
      error: `Error parsing JSON: ${err as string}`,
    };
  }
  if (Array.isArray(json)) {
    return {
      kind: "Error",
      error: `Expected JSON object, got array: ${json as unknown as string}`,
    };
  }
  if (typeof json !== "object" || json === null) {
    return {
      kind: "Error",
      error: `Error parsing JSON: ${json as string}`,
    };
  }

  if (!("index-webview.html" in json)) {
    return {
      kind: "Error",
      error: 'Missing key: "index-webview.html"',
    };
  }

  const index = json["index-webview.html"];

  if (index === null || typeof index !== "object" || Array.isArray(index)) {
    return {
      kind: "Error",
      error: `Invalid value for "files": ${index as string}`,
    };
  }

  const file = loadViteFile(index);
  if (file.kind === "Error") {
    return file;
  }

  const css = loadViteCss(index);
  if (css.kind === "Error") {
    return css;
  }

  const entryPoints = [file.value].concat(css.value);

  return {
    kind: "Ok",
    value: new AssetManifest(new Map(), entryPoints),
  };
}

function loadViteFile(index: object): Result<string, string> {
  if (!("file" in index)) {
    return {
      kind: "Error",
      error: 'Missing key: "file"',
    };
  }
  const file = index.file;
  if (typeof file !== "string") {
    return {
      kind: "Error",
      error: `Invalid value for key "file": ${file as string}`,
    };
  }

  return {
    kind: "Ok",
    value: file,
  };
}

function loadViteCss(index: object): Result<string, string[]> {
  if (!("css" in index)) {
    return {
      kind: "Ok",
      value: [],
    };
  }

  if (!Array.isArray(index.css)) {
    return {
      kind: "Error",
      error: `Invalid value for "css": ${index.css as string}`,
    };
  }

  const result: string[] = [];

  for (const css of index.css) {
    if (typeof css !== "string") {
      return {
        kind: "Error",
        error: `Invalid "css": ${css as string}`,
      };
    }
    result.push(css);
  }

  return {
    kind: "Ok",
    value: result,
  };
}
