import { test, expect } from '@playwright/test';

test.describe('Dashboard 3D Scene', () => {

    test('should load the 3D scene canvas', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/IronSync-3D/);

        // Wait for Three.js to render the canvas
        const canvas = page.locator('#three-canvas-container canvas');
        await expect(canvas).toBeVisible({ timeout: 15000 });
    });

    test('should not show 3D loading failure', async ({ page }) => {
        await page.goto('/');

        // Wait for canvas or hint to appear
        await page.waitForSelector('#three-canvas-container canvas, #hint-overlay', {
            timeout: 15000,
        });

        // Hint should NOT contain failure text
        const hint = page.locator('#hint-overlay');
        await expect(hint).not.toContainText(/失败/);
    });

    test('should display training stats from today\\'s data', async ({ page }) => {
        await page.goto('/');

        // Wait for API data to load (the seed data includes a today training record)
        await page.waitForResponse(
            (resp) =>
                resp.url().includes('/api/training-records/today') &&
                resp.status() === 200,
            { timeout: 15000 }
        );

        // Stats should have updated from default '--'
        const exercisesEl = page.locator('#stat-exercises');
        await expect(exercisesEl).not.toHaveText('--', { timeout: 5000 });

        const setsEl = page.locator('#stat-sets');
        await expect(setsEl).not.toHaveText('--');

        const rpeEl = page.locator('#stat-rpe');
        await expect(rpeEl).not.toHaveText('--');
    });

    test('should display fixed calorie target', async ({ page }) => {
        await page.goto('/');

        await page.waitForSelector('#cal-target', { timeout: 10000 });
        await expect(page.locator('#cal-target')).toHaveText('600 kcal');
    });

    test('should navigate to training page via nav bar', async ({ page }) => {
        await page.goto('/');

        // Click training link in navigation
        await page.click('nav a[href="/training.html"]');
        await expect(page).toHaveTitle(/核心训练记录/);
    });
});
