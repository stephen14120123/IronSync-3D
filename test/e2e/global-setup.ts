import { FullConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

/**
 * Global setup: reset the database to a known seed state before running tests.
 * Calls the dev-only POST /api/test/db-reset endpoint (TestDataController).
 *
 * This ensures each `npx playwright test` run starts from a clean slate.
 */
async function globalSetup(_config: FullConfig) {
    const loginUrl = `${BASE_URL}/api/auth/login`;
    const resetUrl = `${BASE_URL}/api/test/db-reset`;

    // Step 1: Login to get a token
    console.log(`\n[globalSetup] Logging in as admin...`);
    const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: '123456' }),
    });

    if (!loginRes.ok) {
        const body = await loginRes.text();
        throw new Error(`[globalSetup] Login failed (${loginRes.status}): ${body}`);
    }

    const loginJson: any = await loginRes.json();
    if (loginJson.code !== 200) {
        throw new Error(`[globalSetup] Login returned error: ${loginJson.message}`);
    }

    const token: string = loginJson.data.token;

    // Step 2: Call db-reset with the token
    console.log(`[globalSetup] Resetting database via ${resetUrl} ...`);
    const resetRes = await fetch(resetUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!resetRes.ok) {
        const body = await resetRes.text();
        throw new Error(
            `[globalSetup] DB reset failed (${resetRes.status}): ${body}\n` +
            `Make sure the Spring Boot app is running with --spring.profiles.active=dev`
        );
    }

    const resetJson = await resetRes.json();
    if (resetJson.code !== 200) {
        throw new Error(`[globalSetup] DB reset returned error: ${resetJson.message}`);
    }

    console.log('[globalSetup] Database reset complete.');
}

export default globalSetup;
