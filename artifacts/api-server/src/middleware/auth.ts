import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

const JWT_SECRET = requireEnv("JWT_SECRET");

export interface AdminJwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface CustomerJwtPayload {
  id: string;
  email: string;
  name: string;
}

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    if (payload.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    (req as Request & { admin: AdminJwtPayload }).admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function customerAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as CustomerJwtPayload;
    (req as Request & { customer: CustomerJwtPayload }).customer = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
