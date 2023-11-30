// When a test assertion fails, it prints the location (file and line) of the
// assert statements.
//
// This is needed so that it shows the TypeScript source file, instead of the
// compiled JavaScript file.
import "source-map-support/register"; //

// Import the extension early on, so that the code coverage system will be
// initialized (The extension module initializes the code coverage system by
// importing "code_coverage_init").
import "../../extension"; //

// This is checked in the `testCase` function to make sure that the test file
// imported "test_bootstrap" (this file).
(global as any).vicIdeTestBootstrapped = true; // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
