import { TESTS_TIMEOUT } from "./Config";

export function testCase(code: () => Promise<void>): () => Promise<void> {
  return async (): Promise<void> => {
    /* istanbul ignore if */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    if (!((global as any).vicIdeTestBootstrapped as boolean)) {
      throw new Error(`Test file must import "test_bootstrap"!`);
    }

    const timer = setTimeout(
      /* istanbul ignore next */
      () => {
        console.error(`Test timeout after ${TESTS_TIMEOUT}ms, Exiting.`);
        process.exit(1);
      },
      TESTS_TIMEOUT
    );
    await code();
    clearTimeout(timer);
  };
}
