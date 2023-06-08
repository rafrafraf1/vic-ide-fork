import { TESTS_TIMEOUT } from "./Config";

export function testCase(code: () => Promise<void>): () => Promise<void> {
  return async (): Promise<void> => {
    const timer = setTimeout(() => {
      console.error(`Test timeout after ${TESTS_TIMEOUT}ms, Exiting.`);
      process.exit(1);
    }, TESTS_TIMEOUT);
    await code();
    clearTimeout(timer);
  };
}
