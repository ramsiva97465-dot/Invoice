// test/production.test.ts
import { test, expect } from "@playwright/test";
import { login, logout, createCustomer, updateCustomer, deleteCustomer, createInvoice, updateInvoiceStatus, generatePdf, updateCompanySettings, updateTelegramSettings, search } from "../src/tests/helpers";

test.describe("Production End‑to‑End Tests", () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, process.env.VITE_SUPABASE_ANON_KEY!);
  });

  test("Login and Logout", async ({ page }) => {
    await expect(page.locator("text=Dashboard")).toBeVisible();
    await logout(page);
    await expect(page.locator("text=Login")).toBeVisible();
    await login(page, process.env.VITE_SUPABASE_ANON_KEY!);
  });

  test("Customer CRUD", async ({ page }) => {
    const cust = await createCustomer(page, { name: "Test Cust", mobile_number: "1234567890" });
    await expect(page.locator(`text=${cust.name}`)).toBeVisible();
    await updateCustomer(page, cust.id, { name: "Updated Cust" });
    await expect(page.locator("text=Updated Cust")).toBeVisible();
    await deleteCustomer(page, cust.id);
    await expect(page.locator(`text=${cust.name}`)).toHaveCount(0);
  });

  test("Invoice CRUD and Payment Status", async ({ page }) => {
    const inv = await createInvoice(page, { customerId: "1", total_amount: 1000 });
    await expect(page.locator(`text=${inv.invoice_number}`)).toBeVisible();
    await updateInvoiceStatus(page, inv.id, "Paid");
    await expect(page.locator(`text=Paid`)).toBeVisible();
    // Verify mock telegram log was created (edge function writes to test_logs)
    const logs = await page.request.get("/test_logs");
    const logsJson = await logs.json();
    expect(logsJson.some((l: { event: string; invoice_id: string }) => l.event === "payment_received" && l.invoice_id === inv.id)).toBeTruthy();
    // Clean up
    await page.request.delete(`/invoices/${inv.id}`);
  });

  test("Invoice PDF generation", async ({ page }) => {
    const inv = await createInvoice(page, { customerId: "1", total_amount: 500 });
    const pdfBuffer = await generatePdf(page, inv.id);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    await page.request.delete(`/invoices/${inv.id}`);
  });

  test("Company & Telegram Settings", async ({ page }) => {
    await updateCompanySettings(page, { name: "New Co" });
    await expect(page.locator("text=New Co")).toBeVisible();
    await updateTelegramSettings(page, { bot_token: "TESTTOKEN", chat_id: "12345" });
    const resp = await page.request.get("/telegram_settings");
    const data = await resp.json();
    expect(data.bot_token).toBe("TESTTOKEN");
  });

  test("Reports and Search", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.locator("text=Revenue" )).toBeVisible();
    await search(page, "Invoice");
    await expect(page.locator("text=Invoice")).toBeVisible();
  });

  test("Responsive design", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/dashboard");
    await expect(page.locator(".mobile-nav")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator(".desktop-nav")).toBeVisible();
  });
});
