import { Page, Locator } from '@playwright/test';

export class MainPage {
  constructor(private readonly page: Page) {}

  async openAsGuest() {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: /guest log in/i }).click();
  }

  get garageHeading(): Locator {
    return this.page.getByRole('heading', { name: /garage/i });
  }
}
