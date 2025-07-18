// Razorpay TypeScript definitions
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentData {
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    contact?: string;
    email?: string;
  };
  notes: {
    roll_number: string;
    item: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Razorpay configuration
const RAZORPAY_CONFIG = {
  // Note: Replace with your actual Razorpay key_id
  key_id: "rzp_test_1234567890", // Demo key - replace with your actual key
  currency: "INR",
  company_name: "College Canteen",
  company_logo: "", // Optional: Add your logo URL
  theme_color: "#22c55e", // Green theme matching your design
};

export const initializeRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Wait for script to load
    const checkRazorpay = () => {
      if (window.Razorpay) {
        resolve(true);
      } else {
        setTimeout(checkRazorpay, 100);
      }
    };

    checkRazorpay();
  });
};

export const openRazorpayCheckout = async (
  paymentData: RazorpayPaymentData,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void,
): Promise<void> => {
  try {
    // Ensure Razorpay is loaded
    const isLoaded = await initializeRazorpay();
    if (!isLoaded) {
      throw new Error("Razorpay failed to load");
    }

    const options = {
      key: RAZORPAY_CONFIG.key_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: RAZORPAY_CONFIG.company_name,
      description: paymentData.description,
      image: RAZORPAY_CONFIG.company_logo,
      prefill: paymentData.prefill,
      notes: paymentData.notes,
      theme: {
        color: RAZORPAY_CONFIG.theme_color,
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        emi: false,
        paylater: false,
      },
      handler: function (response: RazorpayResponse) {
        onSuccess(response);
      },
      modal: {
        ondismiss: function () {
          onError({ error: "Payment cancelled by user" });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Razorpay initialization error:", error);
    onError(error);
  }
};

// Helper function to convert rupees to paise
export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};

// Helper function to format payment amount for display
export const formatPaymentAmount = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Validate Razorpay payment response
export const validatePaymentResponse = (
  response: RazorpayResponse,
): boolean => {
  return !!(
    response.razorpay_payment_id && response.razorpay_payment_id.length > 0
  );
};

// Generate payment description
export const generatePaymentDescription = (
  item: string,
  studentName: string,
): string => {
  return `${item} - Order by ${studentName}`;
};

// Check if Razorpay is available
export const isRazorpayAvailable = (): boolean => {
  return typeof window !== "undefined" && !!window.Razorpay;
};
