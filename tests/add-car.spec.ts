import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Guest log in' }).click();
  await page.getByRole('button', { name: 'Add car' }).click();
  await page.getByRole('spinbutton', { name: 'Mileage' }).click();
  await page.getByRole('spinbutton', { name: 'Mileage' }).fill('12000');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Audi TT')).toBeVisible();
});
