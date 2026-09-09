# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\lankacare.spec.ts >> LankaCare End-to-End Environment Health Check >> 1. Citizen Portal Homepage loads
- Location: tests\lankacare.spec.ts:7:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - navigation [ref=e6]:
          - button [disabled] [ref=e7]:
            - img "previous" [ref=e8]
          - generic [ref=e10]:
            - generic [ref=e11]: 1/
            - text: "1"
          - button [disabled] [ref=e12]:
            - img "next" [ref=e13]
        - link "Next.js 15.5.25 (outdated) Webpack" [ref=e16] [cursor=pointer]:
          - /url: https://nextjs.org/docs/messages/version-staleness
          - generic "An outdated version detected (latest is 16.3.4), upgrade is highly recommended!" [ref=e19]: Next.js 15.5.25 (outdated)
          - generic [ref=e20]: Webpack
      - dialog "Build Error" [ref=e22]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: Build Error
              - generic [ref=e30]:
                - button "Copy Error Info" [ref=e31] [cursor=pointer]
                - link "Go to related documentation" [ref=e34] [cursor=pointer]:
                  - /url: https://nextjs.org/docs/app/building-your-application/routing/route-groups
                - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools" [ref=e37] [cursor=pointer]:
                  - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
            - paragraph [ref=e47]: "You cannot have two parallel pages that resolve to the same path. Please check /(staff)/ministry/dashboard/page and /ministry/dashboard/page. Refer to the route group docs for more information: https://nextjs.org/docs/app/building-your-application/routing/route-groups"
          - generic [ref=e49]:
            - generic [ref=e51]:
              - generic [ref=e56]: app\(staff)\ministry\dashboard\page.tsx
              - button "Open in editor" [ref=e57] [cursor=pointer]
            - generic [ref=e63]:
              - text: "You cannot have two parallel pages that resolve to the same path. Please check /(staff)/ministry/dashboard/page and /ministry/dashboard/page. Refer to the route group docs for more information:"
              - link "https://nextjs.org/docs/app/building-your-application/routing/route-groups" [ref=e64] [cursor=pointer]:
                - /url: https://nextjs.org/docs/app/building-your-application/routing/route-groups
        - generic [ref=e65]:
          - generic [ref=e66]: "1"
          - generic [ref=e67]: "2"
    - generic [ref=e72] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e73]
      - button "Open issues overlay" [ref=e78]:
        - generic [ref=e79]:
          - generic [aria-hidden] [ref=e80]: "0"
          - generic [ref=e81]: "1"
        - generic [ref=e82]: Issue
  - alert [ref=e83]
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
> 9  |     expect(res?.status()).toBe(200);
     |                           ^ Error: expect(received).toBe(expected) // Object.is equality
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
  36 |     expect(res?.status()).toBe(200);
  37 |   });
  38 | 
  39 |   test('7. Hospital Admin Dashboard loads', async ({ page }) => {
  40 |     const res = await page.goto('/admin/dashboard');
  41 |     expect(res?.status()).toBe(200);
  42 |   });
  43 | });
  44 | 
```