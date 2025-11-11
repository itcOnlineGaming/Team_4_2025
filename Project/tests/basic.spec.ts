import { test, expect } from '@playwright/test';
import { base } from '$app/paths';

test('homepage loads', async ({ page }) => {
  await page.goto(`http://localhost:5173${base}`);
  await expect(page).toHaveTitle(/Task Calendar|Team 4|Calendar/i);
});
