import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

/**
 * Log in via the API and set localStorage so the page-level auth guard
 * in api.js passes on subsequent navigations.
 *
 * Call in beforeEach before navigating to the page under test.
 */
export async function loginAsAdmin(page: Page) {
    const response = await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: { username: 'admin', password: '123456' },
    });

    const json = await response.json();
    if (json.code !== 200) {
        throw new Error(`Auth login failed: ${json.message}`);
    }

    const token: string = json.data.token;

    // Set localStorage before any page JS runs during the next navigation.
    // addInitScript runs on every navigation, but only the first call matters
    // since we remove the flag after applying.
    await page.addInitScript((t) => {
        localStorage.setItem('auth_token', t);
    }, token);
}

/**
 * Navigate to a page that requires auth.
 * Logs in first if not already authenticated.
 */
export async function gotoWithAuth(page: Page, url: string) {
    await loginAsAdmin(page);
    await page.goto(url);
}
