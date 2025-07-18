import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirestoreOrder {
  id?: string;
  name: string;
  roll: string;
  item: string;
  price: number;
  paymentStatus: "Paid" | "Unpaid";
  paymentMethod: "Razorpay" | "Counter" | "Account";
  payment_id?: string; // Razorpay payment ID
  timestamp: Timestamp;
  date: string; // YYYY-MM-DD format
}

export interface OrderSummary {
  totalOrders: number;
  totalMealsToday: number;
  totalRevenue: number;
  totalUnpaid: number;
  itemCounts: Record<string, number>;
}

const ORDERS_COLLECTION = "orders";

// Create a new order
export const createOrder = async (orderData: {
  name: string;
  roll: string;
  item: string;
  price: number;
  paymentStatus: "Paid" | "Unpaid";
  paymentMethod: "Razorpay" | "Counter" | "Account";
  payment_id?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const now = new Date();
    const order: Omit<FirestoreOrder, "id"> = {
      ...orderData,
      timestamp: Timestamp.fromDate(now),
      date: now.toISOString().split("T")[0], // YYYY-MM-DD format
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: "Failed to create order",
    };
  }
};

// Get all orders with optional filtering
export const getOrders = async (filters?: {
  date?: string;
  item?: string;
  paymentStatus?: "Paid" | "Unpaid";
}): Promise<FirestoreOrder[]> => {
  try {
    let q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("timestamp", "desc"),
    );

    // Apply filters
    if (filters?.date) {
      q = query(q, where("date", "==", filters.date));
    }
    if (filters?.item) {
      q = query(q, where("item", "==", filters.item));
    }
    if (filters?.paymentStatus) {
      q = query(q, where("paymentStatus", "==", filters.paymentStatus));
    }

    const querySnapshot = await getDocs(q);
    const orders: FirestoreOrder[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as FirestoreOrder);
    });

    return orders;
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
};

// Listen to real-time orders updates
export const subscribeToOrders = (
  callback: (orders: FirestoreOrder[]) => void,
  filters?: {
    date?: string;
    item?: string;
    paymentStatus?: "Paid" | "Unpaid";
  },
): (() => void) => {
  try {
    let q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("timestamp", "desc"),
    );

    // Apply filters
    if (filters?.date) {
      q = query(q, where("date", "==", filters.date));
    }
    if (filters?.item) {
      q = query(q, where("item", "==", filters.item));
    }
    if (filters?.paymentStatus) {
      q = query(q, where("paymentStatus", "==", filters.paymentStatus));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const orders: FirestoreOrder[] = [];
        querySnapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
          } as FirestoreOrder);
        });
        callback(orders);
      },
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to orders:", error);
    return () => {};
  }
};

// Update payment status
export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: "Paid" | "Unpaid",
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      paymentStatus,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      error: "Failed to update payment status",
    };
  }
};

// Get order summary/statistics
export const getOrderSummary = (orders: FirestoreOrder[]): OrderSummary => {
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((order) => order.date === today);

  const totalOrders = todayOrders.length;
  const totalMealsToday = todayOrders.filter(
    (order) =>
      order.item.toLowerCase().includes("meal") ||
      order.item.toLowerCase().includes("thali"),
  ).length;

  const totalRevenue = todayOrders
    .filter((order) => order.paymentStatus === "Paid")
    .reduce((sum, order) => sum + order.price, 0);

  const totalUnpaid = todayOrders
    .filter((order) => order.paymentStatus === "Unpaid")
    .reduce((sum, order) => sum + order.price, 0);

  // Count items
  const itemCounts: Record<string, number> = {};
  todayOrders.forEach((order) => {
    itemCounts[order.item] = (itemCounts[order.item] || 0) + 1;
  });

  return {
    totalOrders,
    totalMealsToday,
    totalRevenue,
    totalUnpaid,
    itemCounts,
  };
};

// Get today's orders specifically
export const subscribeToTodayOrders = (
  callback: (orders: FirestoreOrder[]) => void,
): (() => void) => {
  const today = new Date().toISOString().split("T")[0];
  return subscribeToOrders(callback, { date: today });
};

// Get unique items for filtering
export const getUniqueItems = (orders: FirestoreOrder[]): string[] => {
  const items = new Set<string>();
  orders.forEach((order) => items.add(order.item));
  return Array.from(items).sort();
};
