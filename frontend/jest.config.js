/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
