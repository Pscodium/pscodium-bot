module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
        'app/**/*.ts',
        '!app/**/*.d.ts',
        '!app/index.ts',
    ],
    moduleFileExtensions: ['ts', 'js', 'json'],
    testTimeout: 10000,
};