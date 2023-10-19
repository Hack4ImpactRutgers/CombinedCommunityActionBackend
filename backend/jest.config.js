export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<backend>'], // Adjust the path to your source code directory
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<backend>/$1', // Adjust this to match your project's directory structure
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
