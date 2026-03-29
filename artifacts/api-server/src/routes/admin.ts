import { Router, Request } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import MenuItem from "../models/MenuItem.js";
import Customer from "../models/Customer.js";
import { adminAuthMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(adminAuthMiddleware);

router.get("/admin/orders", async (req, res) => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && typeof status === "string") {
      filter["status"] = status;
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
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
        customerId: order.customerId?.toString(),
        createdAt: (order as unknown as { createdAt: Date }).createdAt.toISOString(),
        updatedAt: (order as unknown as { updatedAt: Date }).updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to fetch orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params["id"]).lean();
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({
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
      updatedAt: (order as unknown as { updatedAt: Date }).updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["NEW", "IN_KITCHEN", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const order = await Order.findByIdAndUpdate(
      req.params["id"],
      { status },
      { new: true }
    ).lean();
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({
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
      updatedAt: (order as unknown as { updatedAt: Date }).updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }).lean();
    const orderCounts = await Order.aggregate([
      { $group: { _id: "$customerId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    for (const item of orderCounts) {
      if (item._id) countMap.set(item._id.toString(), item.count);
    }
    res.json(
      customers.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        email: c.email,
        orderCount: countMap.get(c._id.toString()) ?? 0,
        createdAt: (c as unknown as { createdAt: Date }).createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to fetch customers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/categories", async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 }).lean();
    res.json(cats.map((c) => ({ _id: c._id.toString(), name: c.name, slug: c.slug, isActive: c.isActive })));
  } catch (err) {
    req.log.error({ err }, "Failed to fetch categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/categories", async (req, res) => {
  try {
    const { name, slug, isActive } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: "Name and slug are required" });
      return;
    }
    const cat = await Category.create({ name, slug, isActive: isActive ?? true });
    res.status(201).json({ _id: cat._id.toString(), name: cat.name, slug: cat.slug, isActive: cat.isActive });
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/categories/:id", async (req, res) => {
  try {
    const { name, slug, isActive } = req.body;
    const cat = await Category.findByIdAndUpdate(
      req.params["id"],
      { name, slug, isActive },
      { new: true }
    ).lean();
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json({ _id: cat._id.toString(), name: cat.name, slug: cat.slug, isActive: cat.isActive });
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params["id"]);
    res.json({ message: "Category deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/items", async (req, res) => {
  try {
    const items = await MenuItem.find().populate("category", "name").sort({ name: 1 }).lean();
    res.json(
      items.map((item) => ({
        _id: item._id.toString(),
        name: item.name,
        category: item.category instanceof mongoose.Types.ObjectId
          ? item.category.toString()
          : (item.category as unknown as { _id: mongoose.Types.ObjectId })._id.toString(),
        categoryName: item.category instanceof mongoose.Types.ObjectId
          ? ""
          : (item.category as unknown as { name: string }).name,
        price: item.price,
        description: item.description ?? "",
        imageUrl: item.imageUrl ?? "",
        isBestSeller: item.isBestSeller,
        isSpicy: item.isSpicy,
        isActive: item.isActive,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to fetch items");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/items", async (req, res) => {
  try {
    const { name, category, price, description, imageUrl, isBestSeller, isSpicy, isActive } = req.body;
    if (!name || !category || price === undefined) {
      res.status(400).json({ error: "Name, category, and price are required" });
      return;
    }
    const item = await MenuItem.create({
      name,
      category,
      price,
      description,
      imageUrl,
      isBestSeller: isBestSeller ?? false,
      isSpicy: isSpicy ?? false,
      isActive: isActive ?? true,
    });
    const populated = await MenuItem.findById(item._id).populate("category", "name").lean();
    res.status(201).json({
      _id: item._id.toString(),
      name: item.name,
      category: item.category.toString(),
      categoryName: populated?.category instanceof mongoose.Types.ObjectId
        ? ""
        : (populated?.category as unknown as { name: string })?.name ?? "",
      price: item.price,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      isBestSeller: item.isBestSeller,
      isSpicy: item.isSpicy,
      isActive: item.isActive,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/items/:id", async (req, res) => {
  try {
    const { name, category, price, description, imageUrl, isBestSeller, isSpicy, isActive } = req.body;
    const item = await MenuItem.findByIdAndUpdate(
      req.params["id"],
      { name, category, price, description, imageUrl, isBestSeller, isSpicy, isActive },
      { new: true }
    ).populate("category", "name").lean();
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.json({
      _id: item._id.toString(),
      name: item.name,
      category: item.category instanceof mongoose.Types.ObjectId
        ? item.category.toString()
        : (item.category as unknown as { _id: mongoose.Types.ObjectId })._id.toString(),
      categoryName: item.category instanceof mongoose.Types.ObjectId
        ? ""
        : (item.category as unknown as { name: string }).name,
      price: item.price,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      isBestSeller: item.isBestSeller,
      isSpicy: item.isSpicy,
      isActive: item.isActive,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/items/:id", async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params["id"]);
    res.json({ message: "Item deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete item");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
