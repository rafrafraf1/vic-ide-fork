import * as Idb from "idb-keyval";

/**
 * If the schema changes then this can be incremented, so that existing browser
 * sessions won't break in bad ways.
 */
const SCHEMA_VERSION = 1;

const SCHEMA_VERSION_KEY: IDBValidKey = "schema_version";

export class BrowserStorage<StateType> {
  constructor(
    private keys: IDBValidKey[],
    private serialize: (state: StateType) => [IDBValidKey, unknown][],
    private deserialize: (input: unknown[]) => StateType | null,
  ) {
    // Do Nothing
  }

  /**
   * Never throws an error
   */
  async getState(): Promise<StateType | null> {
    const allKeys = [SCHEMA_VERSION_KEY].concat(this.keys);
    return await Idb.getMany(allKeys).then(
      (values: unknown[]) => {
        const serializedState = readSavedValues(values);
        if (serializedState === null) {
          return null;
        } else {
          const state = this.deserialize(serializedState);
          if (state === null) {
            // This should never happen because the serialized state should
            // always be consistent thanks to the usage of SCHEMA_VERSION.
            console.warn("Error desrializing state:", serializedState);
            return null;
          }
          return state;
        }
      },
      (err: unknown) => {
        console.warn("Error reading state:", err);
        return null;
      },
    );
  }

  private saving = false;

  private queuedSave: StateType | null = null;

  setState(newState: StateType): void {
    if (this.saving) {
      this.queuedSave = newState;
    } else {
      this.writeState(newState);
    }
  }

  private writeState(state: StateType): void {
    this.saving = true;
    const schemaVersionEntry: [IDBValidKey, unknown] = [
      SCHEMA_VERSION_KEY,
      SCHEMA_VERSION,
    ];
    const allEntries = [schemaVersionEntry].concat(this.serialize(state));
    Idb.setMany(allEntries).then(
      () => {
        if (this.queuedSave !== null) {
          const queuedSave = this.queuedSave;
          this.queuedSave = null;
          this.writeState(queuedSave);
        } else {
          this.saving = false;
        }
      },
      (err: unknown) => {
        this.queuedSave = null;
        this.saving = false;
        console.warn("Error saving state:", err);
      },
    );
  }
}

function readSavedValues(savedValues: unknown[]): unknown[] | null {
  const version = savedValues[0];
  if (version === undefined) {
    console.log("No saved browser state");
    return null;
  }
  if (typeof version !== "number") {
    console.warn(`Invalid "${String(SCHEMA_VERSION_KEY)}" value:`, version);
    return null;
  }
  if (version !== SCHEMA_VERSION) {
    console.warn(`Unsupported "${String(SCHEMA_VERSION_KEY)}":`, version);
    return null;
  }
  return savedValues.slice(1);
}
