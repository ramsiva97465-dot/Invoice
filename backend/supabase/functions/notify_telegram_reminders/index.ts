// Edge Function: notify_telegram_reminders
// This function runs daily via Supabase Cron and sends Telegram reminders to the admin.
// It queries unpaid invoices where the due date is tomorrow or today and sends a message.

import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? Deno.env.get("SUPABASE_FUNCTIONS_TELEGRAM_BOT_TOKEN") ?? "";
const adminChatId = Deno.env.get("ADMIN_TELEGRAM_CHAT_ID") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTelegramCredentials() {
  let botToken = telegramBotToken;
  let chatId = adminChatId;

  if (!botToken || !chatId) {
    console.log("Telegram env vars missing, querying database telegram_settings...");
    try {
      const { data, error } = await supabase
        .from("telegram_settings")
        .select("bot_token, chat_id")
        .maybeSingle();
      if (error) {
        console.error("Failed to query telegram_settings:", error);
      } else if (data) {
        if (!botToken) botToken = data.bot_token ?? "";
        if (!chatId) chatId = data.chat_id ?? "";
        console.log("Successfully retrieved credentials from database");
      } else {
        console.log("No telegram_settings records found in database");
      }
    } catch (e) {
      console.error("Failed to fetch telegram settings from database:", e);
    }
  }

  return { botToken, chatId };
}

async function sendTelegramMessage(text: string) {
  const { botToken, chatId } = await getTelegramCredentials();
  if (!botToken) {
    console.error("Telegram bot token missing");
    return { success: false, error: "Telegram bot token missing" };
  }
  if (!chatId) {
    console.error("Admin chat ID missing");
    return { success: false, error: "Admin chat ID missing" };
  }
  console.log(`Sending Telegram message to chat ${chatId} using bot token ${botToken.slice(0, 6)}...`);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = { chat_id: chatId, text, parse_mode: "HTML" };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    console.error("Telegram send error", await resp.text());
    return { success: false, error: "Telegram API Error" };
  } else {
    console.log("Telegram message sent successfully");
    return { success: true };
  }
}

async function processReminders() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, next_recharge_date, total_amount, customers!inner(name, mobile_number, address, plan_name)")
    .eq("payment_status", "Pending")
    .in("next_recharge_date", [todayStr, tomorrowStr]);

  if (error) {
    console.error("Failed to fetch invoices", error);
    return;
  }
  if (!invoices) return;

  for (const inv of invoices) {
    const nextRechargeDate = inv.next_recharge_date as string;
    const status = nextRechargeDate === todayStr ? "Today" : "Tomorrow";
    const customer = inv.customers || {};
    const message = `🔔 Xivora Invoice Studio\n\nRecharge Reminder\n\nCustomer: ${customer.name ?? ""}\nInvoice: ${inv.invoice_number}\nAmount: ₹${inv.total_amount}\nRecharge Due: ${nextRechargeDate}\nStatus: ${status}`;
    await sendTelegramMessage(message);
    // Update last_reminder_sent_at to avoid duplicate sends same day
    await supabase.from("invoices").update({ last_reminder_sent_at: new Date().toISOString() }).eq("id", inv.id);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Attempt to handle events
  try {
    const { event, invoice_id } = await req.json().catch(() => ({}));
    if (event === "payment_received" && invoice_id) {
      const { data: inv, error } = await supabase
        .from("invoices")
        .select("invoice_number, total_amount, customers!inner(name), next_recharge_date")
        .eq("id", invoice_id)
        .single();
      let sendResult = null;
      if (error) {
        console.error("Failed to fetch invoice for payment notification", error);
        sendResult = { success: false, error: "Database error" };
      } else if (inv) {
        const nextRechargeStr = inv.next_recharge_date ? inv.next_recharge_date : "Not Scheduled";
        const message = `✅ Xivora Invoice Studio\n\nPayment Received\n\nCustomer: ${inv.customers?.name ?? ""}\nInvoice: ${inv.invoice_number}\nAmount: ₹${inv.total_amount}\nPaid On: ${new Date().toISOString().split("T")[0]}\n\nNext Recharge Reminder:\n${nextRechargeStr}`;
        sendResult = await sendTelegramMessage(message);
      }
      return new Response(JSON.stringify({ ok: true, telegramResult: sendResult }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    } else if (event === "invoice_created" && invoice_id) {
      const { data: inv, error } = await supabase
        .from("invoices")
        .select("invoice_number, total_amount, invoice_date, next_recharge_date, payment_status, customers!inner(name)")
        .eq("id", invoice_id)
        .single();
      if (error) {
        console.error("Failed to fetch invoice for creation notification", error);
        sendResult = { success: false, error: "Database error" };
      } else if (inv) {
        // Send notification for newly created invoice regardless of status
        const title = inv.payment_status === "Paid" ? "Invoice Created & Paid" : "New Invoice Created";
        const nextRechargeStr = inv.next_recharge_date ? inv.next_recharge_date : "Not Scheduled";
        const message = `✅ Xivora Invoice Studio\n\n${title}\n\nCustomer: ${inv.customers?.name ?? ""}\nInvoice: ${inv.invoice_number}\nAmount: ₹${inv.total_amount}\nStatus: ${inv.payment_status}\nDate: ${inv.invoice_date}\n\nNext Recharge Reminder:\n${nextRechargeStr}`;
        sendResult = await sendTelegramMessage(message);
      }
      return new Response(JSON.stringify({ ok: true, telegramResult: sendResult }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
  } catch (e) {
    console.error("Error handling event", e);
  }
  // Fallback to daily reminders
  await processReminders();
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
});
