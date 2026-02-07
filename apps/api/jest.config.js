module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {"^.+\\.(t|j)s$": "ts-jest"},
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testTimeout: 30000
};
