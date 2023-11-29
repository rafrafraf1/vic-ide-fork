import type { Result } from "../../src/common/Functional/Result";

export class AssetManifest {
  public constructor(
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

/**
 * Framework used.
 *
 *   - "cra": create-react-app <https://create-react-app.dev/>
 */
const FRAMEWORK = "cra" as string;

export function loadAssetManifest(
  fileContents: string
): Result<string, AssetManifest> {
  if (FRAMEWORK === "cra") {
    return loadCraAssetManifest(fileContents);
  } else {
    throw new Error(`Unknown FRAMEWORK: ${FRAMEWORK}`);
  }
}

export function loadCraAssetManifest(
  fileContents: string
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
