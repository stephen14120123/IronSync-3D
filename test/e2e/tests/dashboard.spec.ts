import { test, expect } from '@playwright/test';
import { gotoWithAuth } from '../helpers/auth-helper';

test.describe('Dashboard 2.5D SVG Scene', () => {

    test('should render the tech-body SVG overlay', async ({ page }) => {
        await gotoWithAuth(page, '/');
        await expect(page).toHaveTitle(/IronSync-3D/);

        // Verify SVG container and tech-body-svg element are rendered
        const container = page.locator('#body-svg-overlay.tech-body-container');
        await expect(container).toBeVisible({ timeout: 15000 });

        const svg = page.locator('.tech-body-svg');
        await expect(svg).toBeVisible();
    });

    test('should render muscle-part geometric elements', async ({ page }) => {
        await gotoWithAuth(page, '/');

        // SVG should contain at least one .muscle-part element with data-mesh attribute
        await page.waitForSelector('.muscle-part[data-mesh]', { timeout: 15000 });
        const muscleParts = page.locator('.muscle-part[data-mesh]');
        const count = await muscleParts.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('should display training stats from today\'s data', async ({ page }) => {
        await gotoWithAuth(page, '/');

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
        await gotoWithAuth(page, '/');

        await page.waitForSelector('#cal-target', { timeout: 10000 });
        await expect(page.locator('#cal-target')).toHaveText('600 kcal');
    });

    test('should navigate to training page via nav bar', async ({ page }) => {
        await gotoWithAuth(page, '/');

        // Click training link in navigation
        await page.click('nav a[href="/training.html"]');
        await expect(page).toHaveTitle(/核心训练记录/);
    });
});
