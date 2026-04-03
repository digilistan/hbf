import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    const id = crypto.randomBytes(8).toString("hex");
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed") as any);
    }
  },
});

router.post("/upload", upload.single("file"), (req: any, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded or invalid format" });
    return;
  }
  
  // Return relative URL assuming express handles static /uploads
  const rawUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: rawUrl });
});

export default router;
