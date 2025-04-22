import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    printConsoleTrace: true,
    disableConsoleIntercept: true,
    silent: false,
  },
});
