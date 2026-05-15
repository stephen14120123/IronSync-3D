import { test, expect } from '@playwright/test';
import { waitForSuccessToast } from '../helpers/toast-helper';

test.describe('Supplement Management', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/supplements.html');
        await expect(page).toHaveTitle(/补剂管家/);
    });

    test('should display supplement cards from seed data', async ({ page }) => {
        await page.waitForSelector('#supplementGrid .sup-card', { timeout: 10000 });
        const cards = page.locator('#supplementGrid .sup-card');
        await expect(cards.first()).toBeVisible();
        const count = await cards.count();
        expect(count).toBeGreaterThanOrEqual(3);
    });

    test('should add a new supplement via modal and verify it appears', async ({ page }) => {
        // Click add button
        await page.click('#addBtn');

        // Wait for modal
        await expect(page.locator('#modal')).toBeVisible({ timeout: 3000 });
        await expect(page.locator('#modalTitle')).toHaveText('新增补剂');

        // Fill form
        await page.fill('#modalForm input[name="name"]', '测试乳清蛋白');
        await page.fill('#modalForm input[name="currentStockG"]', '1000');
        await page.fill('#modalForm input[name="dailyConsumptionG"]', '30');

        // Submit
        await page.click('#modalForm button[type="submit"]');
        await waitForSuccessToast(page);

        // Modal should close
        await expect(page.locator('#modal')).not.toBeVisible();

        // Verify new card appears
        const newCard = page.locator('#supplementGrid .sup-card', { hasText: '测试乳清蛋白' });
        await expect(newCard).toBeVisible({ timeout: 5000 });
    });

    test('should edit an existing supplement', async ({ page }) => {
        await page.waitForSelector('#supplementGrid .sup-card', { timeout: 10000 });

        // Click edit on first card
        await page.locator('#supplementGrid .edit-btn').first().click();

        // Modal should open with title "编辑补剂"
        await expect(page.locator('#modalTitle')).toHaveText('编辑补剂');
        await expect(page.locator('#modal')).toBeVisible();

        // Modify stock value
        const stockInput = page.locator('#modalForm input[name="currentStockG"]');
        await stockInput.fill('200');

        // Save
        await page.click('#modalForm button[type="submit"]');
        await waitForSuccessToast(page);

        // Modal should close
        await expect(page.locator('#modal')).not.toBeVisible();
    });

    test('should filter supplements by search', async ({ page }) => {
        await page.waitForSelector('#supplementGrid .sup-card', { timeout: 10000 });

        // Get initial card count
        const initialCards = await page.locator('#supplementGrid .sup-card').count();

        // Type in search box
        await page.fill('#searchInput', '肌酸');
        // Filter is input-event driven, no debounce

        // Should show fewer or equal cards
        const filteredCards = await page.locator('#supplementGrid .sup-card').count();
        expect(filteredCards).toBeLessThanOrEqual(initialCards);

        // The matching card should be visible
        await expect(page.locator('#supplementGrid .sup-card', { hasText: '肌酸' })).toBeVisible();

        // Clear search
        await page.fill('#searchInput', '');
        const restoredCount = await page.locator('#supplementGrid .sup-card').count();
        expect(restoredCount).toBe(initialCards);
    });

    test('should cancel modal without saving', async ({ page }) => {
        await page.click('#addBtn');
        await expect(page.locator('#modal')).toBeVisible();

        await page.fill('#modalForm input[name="name"]', '不该出现');
        await page.click('#modalCancel');

        await expect(page.locator('#modal')).not.toBeVisible();
    });
});
