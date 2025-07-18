import { RequestHandler } from "express";
import {
  createOrder,
  getOrders,
  updatePaymentStatus,
  getOrderStats,
} from "../database";

// Create a new order
export const createOrderHandler: RequestHandler = async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (
      !orderData.id ||
      !orderData.studentName ||
      !orderData.rollNumber ||
      !orderData.items ||
      !orderData.total ||
      !orderData.paymentMethod ||
      !orderData.paymentStatus
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const result = await createOrder(orderData);

    if (result.success) {
      res.json({
        success: true,
        message: "Order created successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create order",
      });
    }
  } catch (error) {
    console.error("Error in createOrderHandler:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all orders (optionally filtered by date)
export const getOrdersHandler: RequestHandler = async (req, res) => {
  try {
    const { date } = req.query;
    const orders = await getOrders(date as string);

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error in getOrdersHandler:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
};

// Update payment status
export const updatePaymentHandler: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        error: "Order ID and status are required",
      });
    }

    if (status !== "paid" && status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Status must be 'paid' or 'pending'",
      });
    }

    const result = await updatePaymentStatus(orderId, status);

    if (result.success) {
      res.json({
        success: true,
        message: "Payment status updated successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to update payment status",
      });
    }
  } catch (error) {
    console.error("Error in updatePaymentHandler:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get order statistics
export const getStatsHandler: RequestHandler = async (req, res) => {
  try {
    const { date } = req.query;
    const stats = await getOrderStats(date as string);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in getStatsHandler:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
};
