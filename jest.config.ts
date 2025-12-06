// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",        // tells ts-jest to output ESM
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    // This is the magic line everyone forgets
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  // SUPER IMPORTANT FOR NATIVE ESM IN NODE ≥18
  // Without this Jest will still treat files as CommonJS
  runner: "jest-runner",
};

export default config;