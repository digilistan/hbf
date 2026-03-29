import { Router, Request } from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import { customerAuthMiddleware, CustomerJwtPayload } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env["JWT_SECRET"] || "changeme";

router.post("/orders", async (req, res) => {
  try {
    const { items, customerName, customerPhone, customerEmail, customerAddress, area, notes } =
      req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Items are required" });
      return;
    }
    if (!customerName || !customerPhone || !customerAddress) {
      res.status(400).json({ error: "Name, phone, and address are required" });
      return;
    }

    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    // Try to get customerId from auth token
    const authHeader = req.headers.authorization;
    let customerId: string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const payload = jwt.verify(
          authHeader.slice(7),
          JWT_SECRET
        ) as CustomerJwtPayload;
        customerId = payload.id;
      } catch {
        // not authenticated, that's fine
      }
    }

    // Auto-create or find customer account if email provided and not already logged in
    let guestToken: string | undefined;
    if (!customerId && customerEmail) {
      const emailLower = customerEmail.toLowerCase();
      let customer = await Customer.findOne({ email: emailLower });
      if (!customer) {
        // Create account with a random password — user can set it later
        const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        const nameParts = customerName.trim().split(" ");
        const firstName = nameParts[0];
        customer = await Customer.create({
          name: customerName,
          email: emailLower,
          passwordHash,
        });
      }
      customerId = customer._id.toString();
      guestToken = jwt.sign(
        { id: customer._id.toString(), email: customer.email, name: customer.name },
        JWT_SECRET,
        { expiresIn: "30d" }
      );
    }

    const order = await Order.create({
      items,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      area,
      notes,
      total,
      customerId,
    });

    res.status(201).json({
      _id: order._id.toString(),
      items: order.items,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      customerAddress: order.customerAddress,
      area: order.area,
      notes: order.notes,
      paymentMethod: order.paymentMethod,
      status: order.status,
      total: order.total,
      customerId: order.customerId?.toString(),
      createdAt: (order as unknown as { createdAt: Date }).createdAt.toISOString(),
      ...(guestToken ? { guestToken } : {}),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/customers/me/orders",
  customerAuthMiddleware,
  async (req: Request & { customer?: CustomerJwtPayload }, res) => {
    try {
      const customer = req.customer!;
      const orders = await Order.find({ customerId: customer.id }).sort({ createdAt: -1 }).lean();

      res.json(
        orders.map((order) => ({
          _id: order._id.toString(),
          items: order.items,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          customerAddress: order.customerAddress,
          area: order.area,
          notes: order.notes,
          paymentMethod: order.paymentMethod,
          status: order.status,
          total: order.total,
          createdAt: (order as unknown as { createdAt: Date }).createdAt.toISOString(),
        }))
      );
    } catch (err) {
      req.log.error({ err }, "Failed to fetch customer orders");
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
