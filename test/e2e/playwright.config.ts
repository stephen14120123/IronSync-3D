import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
    ],

    timeout: 60000,
    expect: {
        timeout: 15000,
    },

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    globalSetup: require.resolve('./global-setup'),

    webServer: {
        command:
            process.platform === 'win32'
                ? 'mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev'
                : './mvnw spring-boot:run -Dspring-boot.run.profiles=dev',
        port: 8080,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        cwd: '../..',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
