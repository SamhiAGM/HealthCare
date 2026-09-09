# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\lankacare.spec.ts >> LankaCare End-to-End Environment Health Check >> 6. Ministry Command Center loads
- Location: tests\lankacare.spec.ts:34:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Page snapshot

```yaml
- alert [ref=e1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Global setup
  4  | test.use({ baseURL: 'http://localhost:3000' });
  5  | 
  6  | test.describe('LankaCare End-to-End Environment Health Check', () => {
  7  |   test('1. Citizen Portal Homepage loads', async ({ page }) => {
  8  |     const res = await page.goto('/');
  9  |     expect(res?.status()).toBe(200);
  10 |     // Just verify the page didn't crash
  11 |     expect(await page.title()).not.toBe('');
  12 |   });
  13 | 
  14 |   test('2. Receptionist Dashboard loads', async ({ page }) => {
  15 |     const res = await page.goto('/reception/dashboard');
  16 |     expect(res?.status()).toBe(200);
  17 |   });
  18 | 
  19 |   test('3. Doctor Workspace loads', async ({ page }) => {
  20 |     const res = await page.goto('/doctor/queue');
  21 |     expect(res?.status()).toBe(200);
  22 |   });
  23 | 
  24 |   test('4. Lab Tech Dashboard loads', async ({ page }) => {
  25 |     const res = await page.goto('/lab/dashboard');
  26 |     expect(res?.status()).toBe(200);
  27 |   });
  28 | 
  29 |   test('5. Pharmacist Dashboard loads', async ({ page }) => {
  30 |     const res = await page.goto('/pharmacy/dashboard');
  31 |     expect(res?.status()).toBe(200);
  32 |   });
  33 | 
  34 |   test('6. Ministry Command Center loads', async ({ page }) => {
  35 |     const res = await page.goto('/ministry/dashboard');
> 36 |     expect(res?.status()).toBe(200);
     |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  37 |   });
  38 | 
  39 |   test('7. Hospital Admin Dashboard loads', async ({ page }) => {
  40 |     const res = await page.goto('/admin/dashboard');
  41 |     expect(res?.status()).toBe(200);
  42 |   });
  43 | });
  44 | 
```