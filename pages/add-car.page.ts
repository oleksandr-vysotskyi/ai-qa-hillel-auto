import { Page, Locator } from '@playwright/test';

export class AddCarPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.getByRole('button', { name: 'Add car' }).click();
    // technical wait: dialog must be rendered before its fields can be filled
    await this.page.getByRole('heading', { name: 'Add a car' }).waitFor();
  }

  async fillForm(brand: string, model: string, mileage: string) {
    await this.page.getByLabel('Brand').selectOption(brand);
    await this.page.getByLabel('Model').selectOption(model);
    await this.page.getByRole('spinbutton', { name: 'Mileage' }).fill(mileage);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Add' }).click();
  }

  results(carName: string): Locator {
    return this.page.getByText(carName);
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Add a car' });
  }
}
