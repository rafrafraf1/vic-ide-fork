import { getLineErrors } from "./VicDiagnostics";

describe("getLineErrors", () => {
  test("empty string", () => {
    expect(getLineErrors(0, "")).toEqual<Error[]>([]);
  });
});
