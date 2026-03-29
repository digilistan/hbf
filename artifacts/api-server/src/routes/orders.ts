import { Router, Request } from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import AdminUser from "../models/AdminUser.js";
import MenuItem from "../models/MenuItem.js";
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

    // ---------------------------------------------------------
    // Server-side price integrity: look up canonical prices from
    // the database so the client cannot manipulate totals.
    // ---------------------------------------------------------
    const itemIds: string[] = (items as Array<{ itemId: string }>).map((i) => i.itemId);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } }).lean();
    const priceMap = new Map(menuItems.map((m) => [m._id.toString(), m.price]));

    const verifiedItems = (items as Array<{ itemId: string; name: string; quantity: number }>).map(
      (item) => {
        const canonicalPrice = priceMap.get(item.itemId);
        if (canonicalPrice === undefined) {
          throw new Error(`Item not found: ${item.itemId}`);
        }
        return { itemId: item.itemId, name: item.name, price: canonicalPrice, quantity: item.quantity };
      }
    );

    const total = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ---------------------------------------------------------
    // Determine customerId from bearer token (logged-in user)
    // ---------------------------------------------------------
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
        // token invalid or expired — treat as unauthenticated
      }
    }

    // ---------------------------------------------------------
    // If no token: check email against known accounts.
    // - NEW email  → create customer account + issue guestToken
    // - EXISTING customer email → link order to their account (no token)
    // - EXISTING admin email → no customerId, no token (security)
    // ---------------------------------------------------------
    let guestToken: string | undefined;
    if (!customerId && customerEmail) {
      const emailLower = customerEmail.toLowerCase();
      const [existingCustomer, existingAdmin] = await Promise.all([
        Customer.findOne({ email: emailLower }),
        AdminUser.findOne({ email: emailLower }),
      ]);

      if (existingCustomer) {
        // Link to existing customer — do NOT issue a token without credential verification
        customerId = existingCustomer._id.toString();
      } else if (!existingAdmin) {
        // Truly new email — auto-create account and issue a one-time guest token
        const randomPassword =
          Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
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
      // If existingAdmin → no customerId, no token
    }

    const order = await Order.create({
      items: verifiedItems,
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
