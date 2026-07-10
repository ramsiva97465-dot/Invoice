// paymentService.ts

// Since we are running the frontend and backend possibly on different ports locally,
// or on the same domain in production, we need the backend API URL.
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

export const paymentService = {
  async createOrder(amount: number, currency: string = 'INR') {
    const response = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    return data;
  },

  async verifyPayment(paymentData: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) {
    const response = await fetch(`${API_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data;
  }
};
