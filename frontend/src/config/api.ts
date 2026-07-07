export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API = {
  customers: `${API_URL}/api/v1/customers`,
  invoices: `${API_URL}/api/v1/invoices`,
  settings: `${API_URL}/api/v1/settings`,
  telegram: `${API_URL}/api/v1/telegram`,
  communication: `${API_URL}/api/v1/communication`,
};
