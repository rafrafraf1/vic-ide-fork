/**
 * A value that contains either a succesful result ("Ok") or an Error result.
 */
export type Result<E, T> = Result.Ok<T> | Result.Error<E>;

export namespace Result {
  export interface Error<E> {
    kind: "Error";
    error: E;
  }

  export interface Ok<T> {
    kind: "Ok";
    value: T;
  }
}
