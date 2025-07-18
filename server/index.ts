import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { initializeDatabase } from "./database";
import {
  createOrderHandler,
  getOrdersHandler,
  updatePaymentHandler,
  getStatsHandler,
} from "./routes/orders";

export function createServer() {
  const app = express();

  // Initialize database
  initializeDatabase().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Order management routes
  app.post("/api/orders", createOrderHandler);
  app.get("/api/orders", getOrdersHandler);
  app.put("/api/orders/:orderId/payment", updatePaymentHandler);
  app.get("/api/stats", getStatsHandler);

  return app;
}
