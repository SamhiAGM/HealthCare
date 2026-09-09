import { test, expect } from '@playwright/test';

// Global setup
test.use({ baseURL: 'http://localhost:3000' });

test.describe('LankaCare End-to-End Environment Health Check', () => {
  test('1. Citizen Portal Homepage loads', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    // Just verify the page didn't crash
    expect(await page.title()).not.toBe('');
  });

  test('2. Receptionist Dashboard loads', async ({ page }) => {
    const res = await page.goto('/reception/dashboard');
    expect(res?.status()).toBe(200);
  });

  test('3. Doctor Workspace loads', async ({ page }) => {
    const res = await page.goto('/doctor/queue');
    expect(res?.status()).toBe(200);
  });

  test('4. Lab Tech Dashboard loads', async ({ page }) => {
    const res = await page.goto('/lab/dashboard');
    expect(res?.status()).toBe(200);
  });

  test('5. Pharmacist Dashboard loads', async ({ page }) => {
    const res = await page.goto('/pharmacy/dashboard');
    expect(res?.status()).toBe(200);
  });

  test('6. Ministry Command Center loads', async ({ page }) => {
    const res = await page.goto('/ministry/dashboard');
    expect(res?.status()).toBe(200);
  });

  test('7. Hospital Admin Dashboard loads', async ({ page }) => {
    const res = await page.goto('/admin/dashboard');
    expect(res?.status()).toBe(200);
  });
});
