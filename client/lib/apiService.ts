import { Order } from "./AppContext";

const API_BASE = "/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Order API functions
export async function createOrder(order: Order): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: order.id,
        studentName: order.studentName,
        rollNumber: order.rollNumber,
        items: order.items,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: "Failed to create order",
    };
  }
}

export async function getOrders(date?: string): Promise<ApiResponse<Order[]>> {
  try {
    const url = new URL(`${window.location.origin}${API_BASE}/orders`);
    if (date) {
      url.searchParams.append("date", date);
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.success) {
      // Convert timestamp strings back to Date objects
      const orders = data.orders.map((order: any) => ({
        ...order,
        timestamp: new Date(order.timestamp),
      }));
      return {
        success: true,
        data: orders,
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      error: "Failed to fetch orders",
    };
  }
}

export async function updatePaymentStatus(
  orderId: string,
  status: "paid" | "pending",
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/payment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      error: "Failed to update payment status",
    };
  }
}

export async function getOrderStats(date?: string): Promise<
  ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    pendingAmount: number;
    totalMeals: number;
  }>
> {
  try {
    const url = new URL(`${window.location.origin}${API_BASE}/stats`);
    if (date) {
      url.searchParams.append("date", date);
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        data: data.stats,
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}

// Check if API is available
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/ping`);
    const data = await response.json();
    return response.ok && data.message;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}
