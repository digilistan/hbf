import { Router } from "express";
import Category from "../models/Category.js";
import MenuItem from "../models/MenuItem.js";

const router = Router();

router.get("/menu", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).lean();
    const items = await MenuItem.find({ isActive: true }).lean();

    const serializeItem = (item: any) => ({
      _id: item._id.toString(),
      name: item.name,
      category: item.category.toString(),
      price: item.price,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      isBestSeller: item.isBestSeller,
      isSpicy: item.isSpicy,
      isActive: item.isActive,
    });

    const categoryMap = categories.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      items: items
        .filter((item) => item.category.toString() === cat._id.toString())
        .map(serializeItem),
    }));

    const bestSellers = items
      .filter((item) => item.isBestSeller)
      .map(serializeItem);

    res.json({ categories: categoryMap, bestSellers });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch menu");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
