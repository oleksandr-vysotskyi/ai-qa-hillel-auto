import { test, expect } from '@playwright/test';
import { MainPage } from '../pages/main.page';
import { AddCarPage } from '../pages/add-car.page';

test('guest can add a car to Garage', async ({ page }) => {
  const mainPage = new MainPage(page);
  const addCarPage = new AddCarPage(page);

  await mainPage.openAsGuest();
  await expect(page).toHaveURL(/panel\/garage/);
  await expect(mainPage.garageHeading).toBeVisible();

  await addCarPage.open();
  await expect(addCarPage.heading).toBeVisible();

  await addCarPage.fillForm('Audi', 'TT', '12000');
  await addCarPage.submit();

  await expect(page).toHaveURL(/panel\/garage/);
  await expect(addCarPage.results('Audi TT')).toBeVisible();
});
