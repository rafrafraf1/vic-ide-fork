import {
  ENABLE_COVERAGE_ENV_VAR,
  initCodeCoverage,
} from "./code_coverage_support";

if (process.env[ENABLE_COVERAGE_ENV_VAR] === "1") {
  initCodeCoverage();
}
