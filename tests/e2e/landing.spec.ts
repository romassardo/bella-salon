import { test, expect } from '@playwright/test';

test.describe('Landing Salón Bella', () => {
  test('renders all sections and CTAs', async ({ page }) => {
    await page.goto('/');

    // Hero
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Belleza');
    await expect(page.getByRole('link', { name: /Reservar turno/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Hablar con Bella/i })).toBeVisible();

    // Catalog
    await expect(page.getByRole('heading', { name: /catálogo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Manicure/i }).first()).toBeVisible();

    // Assistant
    await expect(page.getByRole('heading', { name: /Bella/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Escribile a Bella/i)).toBeVisible();

    // Booking
    await expect(page.getByText(/Cuatro pasos/i)).toBeVisible();
    await expect(page.getByText(/Paso 01 \/ 04/)).toBeVisible();
  });

  test('booking step 1 to 2', async ({ page }) => {
    await page.goto('/#res');
    await page.getByRole('button', { name: /^Corte/i }).click();
    await page.getByRole('button', { name: /^Continuar/i }).click();
    await expect(page.getByText(/Elegí día y hora/i)).toBeVisible();
  });
});
