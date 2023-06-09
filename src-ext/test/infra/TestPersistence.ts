import * as fs from "fs";
import * as tmp from "tmp";

const STATE_FILE_ENV_VAR = "VIC_IDE_TEST_STATE_FILE";

export class PersistentState<T> {
  constructor(initialState: T) {
    this.initialState = initialState;
  }

  set(value: T): void {
    writePersistentStateFile(JSON.stringify(value));
  }

  get(): T {
    const state = readPersistentStateFile();
    if (state === "") {
      return this.initialState;
    } else {
      return JSON.parse(state) as T;
    }
  }

  private initialState: T;
}

function readPersistentStateFile(): string {
  const filename = process.env[STATE_FILE_ENV_VAR];
  if (filename === undefined) {
    throw new Error(`${STATE_FILE_ENV_VAR} environment var not set`);
  }
  return fs.readFileSync(filename, "utf8");
}

function writePersistentStateFile(value: string): void {
  const filename = process.env[STATE_FILE_ENV_VAR];
  if (filename === undefined) {
    throw new Error(`${STATE_FILE_ENV_VAR} environment var not set`);
  }
  fs.writeFileSync(filename, value, "utf8");
}

async function withTmpFile<A>(
  body: (filename: string) => Promise<A>
): Promise<A> {
  const file = tmp.fileSync({
    discardDescriptor: true,
  });
  try {
    return await body(file.name);
  } finally {
    file.removeCallback();
  }
}

export async function withPersistentStateAvailable<A>(
  body: (envVarName: string, envVarValue: string) => Promise<A>
): Promise<A> {
  return await withTmpFile(async (filename) => {
    return await body(STATE_FILE_ENV_VAR, filename);
  });
}
