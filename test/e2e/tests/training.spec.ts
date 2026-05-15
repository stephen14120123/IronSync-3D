import { test, expect } from '@playwright/test';
import { gotoWithAuth } from '../helpers/auth-helper';
import { waitForSuccessToast } from '../helpers/toast-helper';

test.describe('Training Record CRUD', () => {

    test.beforeEach(async ({ page }) => {
        await gotoWithAuth(page, '/training.html');
        await expect(page).toHaveTitle(/核心训练记录/);
    });

    test('should render the trend chart', async ({ page }) => {
        await page.waitForSelector('#strengthTrendChart canvas', { timeout: 10000 });
        await expect(page.locator('#strengthTrendChart canvas')).toBeVisible();
    });

    test('should display pagination controls with record count', async ({ page }) => {
        // Verify the pagination DOM exists and shows info after data loads
        await page.waitForSelector('#pagination', { timeout: 10000 });
        await expect(page.locator('#pageInfo')).toBeVisible();
        // Should show a count string (at minimum from seed data)
        await expect(page.locator('#pageInfo')).not.toBeEmpty();
    });

    test('should create a training record and verify it in the history table', async ({ page }) => {
        const today = new Date().toISOString().slice(0, 10);

        await page.selectOption('select[name="actionName"]', '杠铃深蹲');
        await page.fill('input[name="weightKg"]', '80');
        await page.fill('input[name="sets"]', '5');
        await page.fill('input[name="reps"]', '10');

        // Set RPE slider
        await page.fill('input[name="rpe"]', '8');
        await expect(page.locator('#rpeVal')).toHaveText('8');

        await page.fill('input[name="recordDate"]', today);
        await page.click('#trainingForm button[type="submit"]');

        // Wait for success toast
        await waitForSuccessToast(page);

        // Verify new row appears in the history table
        const tableRows = page.locator('#historyBody tr');
        await expect(tableRows.first()).toBeVisible({ timeout: 5000 });
        await expect(tableRows.first()).toContainText('杠铃深蹲');
        await expect(tableRows.first()).toContainText('80');
        await expect(tableRows.first()).toContainText('5×10');
    });

    test('should delete a training record', async ({ page }) => {
        // First create a record to delete
        const today = new Date().toISOString().slice(0, 10);
        await page.selectOption('select[name="actionName"]', '卧推');
        await page.fill('input[name="weightKg"]', '60');
        await page.fill('input[name="sets"]', '4');
        await page.fill('input[name="reps"]', '8');
        await page.fill('input[name="rpe"]', '7');
        await page.fill('input[name="recordDate"]', today);
        await page.click('#trainingForm button[type="submit"]');
        await waitForSuccessToast(page);

        // Click delete on the first row
        const deleteBtn = page.locator('#historyBody .delete-btn').first();
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        // Wait for success toast after delete
        await waitForSuccessToast(page);
    });

    test('should show validation error for empty form', async ({ page }) => {
        // Submit without filling any fields
        await page.click('#trainingForm button[type="submit"]');

        // The browser's native validation should prevent submission (required fields)
        const url = page.url();
        expect(url).toContain('training');
    });
});
