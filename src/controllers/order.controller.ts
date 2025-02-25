import { NextFunction, Request, Response } from "express";
import Order from "../models/order.model";
import { AppError } from "../error/GlobalErrorHandler";
import { sendOrderDelivered, sendOrderShipped } from "../email/emailService";

export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status }: { status: "SHIPPED" | "DELIVERED" } = req.body;
    const { orderId } = req.params;

    if (status !== "SHIPPED" && status !== "DELIVERED") {
      throw new AppError("Invalid status", 400);
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (order?.status === "SHIPPED") {
      sendOrderShipped(order.email, order);
    } else if (order?.status === "DELIVERED") {
      sendOrderDelivered(order.email, order);
    }

    res.json({
      success: true,
      updatedStatus: order?.status,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchOrderByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;

    if (status !== "SHIPPED" && status !== "DELIVERED" && status !== "FAILED") {
      throw new AppError("Invalid status", 400);
    }

    const order = await Order.find({ status });

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const fetchCustomerPaidOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.find({ userId: req.user?.id, paid: true });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const fetchCustomerFailedOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.find({ userId: req.user?.id, paid: false });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const getAllCustomerOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.find({ userId: req.user?.id }).sort({
      createdAt: -1,
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
};
