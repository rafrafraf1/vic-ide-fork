import * as Mocha from "mocha";
import * as glob from "glob";
import * as path from "path";

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "..");

  await new Promise<void>((c, e) => {
    glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
      if (err !== null) {
        e(err);
        return;
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err: unknown) {
        console.error(err);
        e(err);
      }
    });
  });
}
