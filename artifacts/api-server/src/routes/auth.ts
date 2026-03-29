import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";
import Customer from "../models/Customer.js";

const router = Router();
const JWT_SECRET = process.env["JWT_SECRET"] || "changeme";

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, email: admin.email, role: admin.role, name: "Admin" });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({ name, email, passwordHash });

    const token = jwt.sign(
      { id: customer._id.toString(), email: customer.email, name: customer.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({ token, email: customer.email, name: customer.name });
  } catch (err) {
    req.log.error({ err }, "Customer registration failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: customer._id.toString(), email: customer.email, name: customer.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token, email: customer.email, name: customer.name });
  } catch (err) {
    req.log.error({ err }, "Customer login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
