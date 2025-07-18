import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";

// Database path
const DB_PATH = path.join(process.cwd(), "canteen.db");

// Create database connection
const db = new sqlite3.Database(DB_PATH);

// Promisify database methods for async/await
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create orders table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        student_name TEXT NOT NULL,
        roll_number TEXT NOT NULL,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table for better normalization (optional)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        item_price REAL NOT NULL,
        item_category TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Order-related database operations
export interface DbOrder {
  id: string;
  student_name: string;
  roll_number: string;
  items: string; // JSON string
  total: number;
  payment_method: string;
  payment_status: string;
  timestamp: string;
}

export async function createOrder(order: {
  id: string;
  studentName: string;
  rollNumber: string;
  items: any[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}) {
  try {
    await dbRun(
      `
      INSERT INTO orders (id, student_name, roll_number, items, total, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        order.id,
        order.studentName,
        order.rollNumber,
        JSON.stringify(order.items),
        order.total,
        order.paymentMethod,
        order.paymentStatus,
      ],
    );

    // Also insert individual items for better querying
    for (const item of order.items) {
      await dbRun(
        `
        INSERT INTO order_items (order_id, item_id, item_name, item_price, item_category, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          order.id,
          item.id,
          item.name,
          item.price,
          item.category,
          item.quantity,
        ],
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error };
  }
}

export async function getOrders(date?: string) {
  try {
    let query = "SELECT * FROM orders";
    const params: any[] = [];

    if (date) {
      query += " WHERE date(timestamp) = date(?)";
      params.push(date);
    }

    query += " ORDER BY timestamp DESC";

    const orders = (await dbAll(query, params)) as DbOrder[];

    // Parse items JSON for each order
    return orders.map((order) => ({
      id: order.id,
      studentName: order.student_name,
      rollNumber: order.roll_number,
      items: JSON.parse(order.items),
      total: order.total,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      timestamp: new Date(order.timestamp),
    }));
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}

export async function updatePaymentStatus(
  orderId: string,
  status: "paid" | "pending",
) {
  try {
    await dbRun(
      `
      UPDATE orders SET payment_status = ? WHERE id = ?
    `,
      [status, orderId],
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error };
  }
}

export async function getOrderStats(date?: string) {
  try {
    const today = date || new Date().toISOString().split("T")[0];

    const stats = (await dbGet(
      `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN total ELSE 0 END) as pending_amount
      FROM orders 
      WHERE date(timestamp) = date(?)
    `,
      [today],
    )) as any;

    const mealStats = (await dbGet(
      `
      SELECT SUM(quantity) as total_meals
      FROM order_items 
      WHERE item_category = 'meal' 
      AND date((SELECT timestamp FROM orders WHERE id = order_items.order_id)) = date(?)
    `,
      [today],
    )) as any;

    return {
      totalOrders: stats.total_orders || 0,
      totalRevenue: stats.total_revenue || 0,
      pendingAmount: stats.pending_amount || 0,
      totalMeals: mealStats.total_meals || 0,
    };
  } catch (error) {
    console.error("Error getting order stats:", error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingAmount: 0,
      totalMeals: 0,
    };
  }
}

export { db, dbRun, dbGet, dbAll };
