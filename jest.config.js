export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@/entities/(.*)$": "<rootDir>/src/entities/$1",
    "^@/features/(.*)$": "<rootDir>/src/features/$1",
    "^@/widgets/(.*)$": "<rootDir>/src/widgets/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/shared/config/jest.setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/main.tsx",
  ],
};
