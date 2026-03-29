import { Router, Request } from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import AdminUser from "../models/AdminUser.js";
import { customerAuthMiddleware, CustomerJwtPayload } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}
const JWT_SECRET = requireEnv("JWT_SECRET");

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

    // Only auto-create a new account for completely new emails.
    // We must NEVER issue a token for any email that already exists in Customer or AdminUser.
    let guestToken: string | undefined;
    if (!customerId && customerEmail) {
      const emailLower = customerEmail.toLowerCase();
      const [existingCustomer, existingAdmin] = await Promise.all([
        Customer.findOne({ email: emailLower }),
        AdminUser.findOne({ email: emailLower }),
      ]);
      if (!existingCustomer && !existingAdmin) {
        // Truly new email — create a guest account with a random password
        // (user can claim it later via a password-reset flow)
        const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        const newCustomer = await Customer.create({
          name: customerName,
          email: emailLower,
          passwordHash,
        });
        customerId = newCustomer._id.toString();
        guestToken = jwt.sign(
          { id: newCustomer._id.toString(), email: newCustomer.email, name: newCustomer.name },
          JWT_SECRET,
          { expiresIn: "30d" }
        );
      }
      // If the email already exists (as customer or admin), link the order by email
      // but do NOT issue a token — the user must log in with their credentials.
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
