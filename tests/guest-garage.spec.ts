import { test, expect } from '@playwright/test';
import { MainPage } from '../pages/main.page';

test('guest can open Garage', async ({ page }) => {
  const mainPage = new MainPage(page);

  await mainPage.openAsGuest();
  await expect(page).toHaveURL(/panel\/garage/);
  await expect(mainPage.garageHeading).toBeVisible();
});
