import "source-map-support/register"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import { COVERAGE_REQUESTED, initCodeCoverageForProcess } from "./CodeCoverage";

if (COVERAGE_REQUESTED) {
  initCodeCoverageForProcess();
}
