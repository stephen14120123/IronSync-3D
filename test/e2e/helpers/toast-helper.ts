import { expect, Page } from '@playwright/test';

const TOAST_TIMEOUT = 3000;

/**
 * Wait for a success Toast notification to appear and then disappear.
 * The toast system auto-dismisses after ~2500ms.
 */
export async function waitForSuccessToast(page: Page) {
    const toast = page.locator('.toast-container div').first();
    await expect(toast).toBeVisible({ timeout: TOAST_TIMEOUT });
    // Wait for it to fade out (opacity -> 0 then removed)
    await page.waitForTimeout(3000);
}

/**
 * Assert that no error toast is visible.
 */
export async function assertNoErrorToast(page: Page) {
    const errorToasts = page.locator('.toast-container div');
    const count = await errorToasts.count();
    for (let i = 0; i < count; i++) {
        const bg = await errorToasts.nth(i).evaluate(el => getComputedStyle(el).backgroundColor);
        // Red background = error toast (#F44336)
        expect(bg).not.toBe('rgb(244, 67, 54)');
    }
}
