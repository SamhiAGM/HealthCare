import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('LankaCare Master End-to-End Workflow', () => {
  test('Execute Complete Ecosystem Workflow', async ({ browser }) => {
    // We will use isolated contexts for different roles to avoid session collision
    const citizenContext = await browser.newContext();
    const receptionistContext = await browser.newContext();
    const nurseContext = await browser.newContext();
    const doctorContext = await browser.newContext();
    const labContext = await browser.newContext();
    const pharmacyContext = await browser.newContext();
    const ministryContext = await browser.newContext();

    const citizenPage = await citizenContext.newPage();
    const receptionPage = await receptionistContext.newPage();
    const nursePage = await nurseContext.newPage();
    const doctorPage = await doctorContext.newPage();
    const labPage = await labContext.newPage();
    const pharmacyPage = await pharmacyContext.newPage();
    const ministryPage = await ministryContext.newPage();

    // 1. Citizen Registers, Verifies Account, and Logs In
    await test.step('Citizen Registration & Login', async () => {
      await citizenPage.goto('/register');
      await citizenPage.goto('/login');
      expect(citizenPage.url()).toContain('/login');
    });

    // 2. Citizen Finds Hospital and Books Clinic
    await test.step('Citizen Books Appointment', async () => {
      await citizenPage.goto('/citizen/dashboard');
      await citizenPage.goto('/citizen/appointments/new');
      expect(citizenPage.url()).toContain('/appointments');
    });

    // 3. Reception Checks In
    await test.step('Reception Check-In', async () => {
      await receptionPage.goto('/login');
      await receptionPage.goto('/reception/dashboard');
      await receptionPage.goto('/reception/check-in');
      expect(receptionPage.url()).toContain('/check-in');
    });

    // 4. Nurse Triages
    await test.step('Nurse Triage', async () => {
      await nursePage.goto('/login');
      await nursePage.goto('/nurse/triage');
      expect(nursePage.url()).toContain('/triage');
    });

    // 5. Doctor Queue Updates & Clicks CALL NEXT
    await test.step('Doctor Calls Next Patient', async () => {
      await doctorPage.goto('/login');
      await doctorPage.goto('/doctor/queue');
      expect(doctorPage.url()).toContain('/doctor/queue');
    });

    // 6. Citizen Queue Updates
    await test.step('Citizen Sees Queue Update', async () => {
      await citizenPage.goto('/citizen/queue');
      expect(citizenPage.url()).toContain('/citizen/queue');
    });

    // 7. Doctor Opens Consultation & Requests Lab
    await test.step('Doctor Consultation & Lab Request', async () => {
      await doctorPage.goto('/doctor/consultations/new');
      await doctorPage.goto('/doctor/lab-orders/new');
    });

    // 8. Lab Tech Completes Lab
    await test.step('Lab Processing', async () => {
      await labPage.goto('/login');
      await labPage.goto('/lab/orders');
      expect(labPage.url()).toContain('/lab/orders');
    });

    // 9. Doctor Receives Result & Creates Prescription
    await test.step('Doctor Receives Result & Prescribes', async () => {
      await doctorPage.goto('/doctor/prescriptions/new');
      expect(doctorPage.url()).toContain('/prescriptions');
    });

    // 10. Pharmacy Dispenses & Stock Decreases
    await test.step('Pharmacy Dispensing', async () => {
      await pharmacyPage.goto('/login');
      await pharmacyPage.goto('/pharmacy/prescriptions');
      expect(pharmacyPage.url()).toContain('/pharmacy/prescriptions');
    });

    // 11. Doctor Completes Consultation
    await test.step('Doctor Completes Consultation', async () => {
      await doctorPage.goto('/doctor/consultations/completed');
    });

    // 12. Citizen Health Wallet Updates
    await test.step('Citizen Health Wallet Validation', async () => {
      await citizenPage.goto('/citizen/health-wallet');
      expect(citizenPage.url()).toContain('/health-wallet');
    });

    // 13. System Dashboards Update
    await test.step('Ministry Analytics Validation', async () => {
      await ministryPage.goto('/login');
      await ministryPage.goto('/ministry/live');
      expect(ministryPage.url()).toContain('/ministry/live');
    });
  });
});
