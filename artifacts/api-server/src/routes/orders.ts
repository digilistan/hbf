import { Router, Request } from "express";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import { customerAuthMiddleware, CustomerJwtPayload } from "../middleware/auth.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;

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

    const invalidItems = (items as Array<{ itemId?: unknown; quantity?: unknown }>).filter(
      (i) => typeof i.itemId !== "string" || !Number.isInteger(i.quantity) || (i.quantity as number) < 1
    );
    if (invalidItems.length > 0) {
      res.status(400).json({ error: "Each item must have a valid itemId and quantity >= 1" });
      return;
    }

    // Validate items and resolve canonical prices from the database
    const itemIds = (items as Array<{ itemId: string }>).map((i) => i.itemId);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } }).lean();
    const priceMap = new Map(menuItems.map((m) => [m._id.toString(), m.price]));

    const typedItems = items as Array<{ itemId: string; name: string; quantity: number }>;
    const unknownIds = typedItems.filter((i) => !priceMap.has(i.itemId)).map((i) => i.itemId);
    if (unknownIds.length > 0) {
      res.status(400).json({ error: `Unknown item IDs: ${unknownIds.join(", ")}` });
      return;
    }

    const verifiedItems = typedItems.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      price: priceMap.get(item.itemId)!,
      quantity: item.quantity,
    }));

    const total = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Resolve customerId from bearer token when the customer is logged in
    const authHeader = req.headers.authorization;
    let customerId: string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as CustomerJwtPayload;
        customerId = payload.id;
      } catch {
        // Invalid or expired token — treat request as unauthenticated
      }
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
