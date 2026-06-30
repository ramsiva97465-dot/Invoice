// src/tests/helpers.ts
import type { Page } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:4173";

export async function login(page: Page) {
  await page.goto(`${baseUrl}/login`);
  // Assuming the login page has a button that triggers Supabase magic link/auth
  await page.click("text=Login");
  // Wait for dashboard navigation
  await page.waitForURL(`${baseUrl}/dashboard`);
}

export async function logout(page: Page) {
  await page.click("[data-testid=logout-button]");
  await page.waitForURL("/**/login");
}

/** Customer CRUD helpers */
export async function createCustomer(page: Page, data: { name: string; mobile_number: string }) {
  await page.goto("/customers");
  await page.click("text=Add Customer");
  await page.fill('input[name="name"]', data.name);
  await page.fill('input[name="mobile_number"]', data.mobile_number);
  await page.click("text=Save");
  // Return a simple object with id/name (mocked from response)
  const response = await page.request.post(`/customers`, { data });
  return await response.json();
}

export async function updateCustomer(page: Page, id: string, updates: { name?: string }) {
  await page.goto(`/customers/${id}/edit`);
  if (updates.name) await page.fill('input[name="name"]', updates.name);
  await page.click("text=Update");
  await page.request.put(`/customers/${id}`, { data: updates });
}

export async function deleteCustomer(page: Page, id: string) {
  await page.request.delete(`/customers/${id}`);
}

/** Invoice helpers */
export async function createInvoice(page: Page, data: { customerId: string; total_amount: number }) {
  await page.goto("/invoices");
  await page.click("text=Create Invoice");
  await page.selectOption('select[name="customer_id"]', data.customerId);
  await page.fill('input[name="total_amount"]', String(data.total_amount));
  await page.click("text=Save");
  const resp = await page.request.post(`/invoices`, { data });
  return await resp.json();
}

export async function updateInvoiceStatus(page: Page, id: string, status: "Paid" | "Pending") {
  await page.goto(`/invoices/${id}`);
  await page.click(`button[data-status="${status === "Paid" ? "Pending" : "Paid"}"]`);
  await page.request.patch(`/invoices/${id}`, { data: { payment_status: status } });
}

export async function generatePdf(page: Page, invoiceId: string) {
  await page.goto(`/invoices/${invoiceId}`);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("text=Download PDF"),
  ]);
  return await download.path();
}

/** Settings helpers */
export async function updateCompanySettings(page: Page, data: { name: string }) {
  await page.goto("/settings/company");
  await page.fill('input[name="name"]', data.name);
  await page.click("text=Save");
  await page.request.put(`/company_settings`, { data });
}

export async function updateTelegramSettings(page: Page, data: { bot_token: string; chat_id: string }) {
  await page.goto("/settings/telegram");
  await page.fill('input[name="bot_token"]', data.bot_token);
  await page.fill('input[name="chat_id"]', data.chat_id);
  await page.click("text=Save");
  await page.request.put(`/telegram_settings`, { data });
}

/** Search helper */
export async function search(page: Page, query: string) {
  await page.fill('input[placeholder="Search"]', query);
  await page.press('input[placeholder="Search"]', "Enter");
}
