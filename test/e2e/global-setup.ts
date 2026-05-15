import { FullConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

/**
 * Global setup: reset the database to a known seed state before running tests.
 * Calls the dev-only POST /api/test/db-reset endpoint (TestDataController).
 *
 * This ensures each `npx playwright test` run starts from a clean slate.
 */
async function globalSetup(_config: FullConfig) {
    const url = `${BASE_URL}/api/test/db-reset`;

    console.log(`\n[globalSetup] Resetting database via ${url} ...`);

    const response = await fetch(url, { method: 'POST' });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(
            `[globalSetup] DB reset failed (${response.status}): ${body}\n` +
            `Make sure the Spring Boot app is running with --spring.profiles.active=dev`
        );
    }

    const json = await response.json();
    if (json.code !== 200) {
        throw new Error(`[globalSetup] DB reset returned error: ${json.message}`);
    }

    console.log('[globalSetup] Database reset complete.');
}

export default globalSetup;
