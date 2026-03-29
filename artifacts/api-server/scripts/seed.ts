import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env["MONGO_URI"];
const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] || "admin@hbffoods.com";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] || "admin123";

if (!MONGO_URI) {
  console.error("MONGO_URI is not set");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log("Connected to MongoDB");

const CategorySchema = new mongoose.Schema({ name: String, slug: String, isActive: Boolean });
const MenuItemSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  price: Number,
  description: String,
  imageUrl: String,
  isBestSeller: Boolean,
  isSpicy: Boolean,
  isActive: Boolean,
});
const AdminUserSchema = new mongoose.Schema({ email: String, passwordHash: String, role: String });

const Category = mongoose.model("Category", CategorySchema);
const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
const AdminUser = mongoose.model("AdminUser", AdminUserSchema);

const categories = [
  { name: "Burgers", slug: "burgers" },
  { name: "Pizzas", slug: "pizzas" },
  { name: "Fries & Sides", slug: "fries-sides" },
  { name: "Wings & Chicken", slug: "wings-chicken" },
  { name: "Rolls & Sandwiches", slug: "rolls-sandwiches" },
  { name: "BBQ & Special", slug: "bbq-special" },
  { name: "Drinks", slug: "drinks" },
];

console.log("Seeding categories...");
await Category.deleteMany({});
const createdCategories = await Category.insertMany(
  categories.map((c) => ({ ...c, isActive: true }))
);

const catMap: Record<string, mongoose.Types.ObjectId> = {};
for (const cat of createdCategories) {
  catMap[cat.get("slug")] = cat._id as mongoose.Types.ObjectId;
}

console.log("Seeding menu items with images and size variants...");
await MenuItem.deleteMany({});
await MenuItem.insertMany([
  // ─── BURGERS ───────────────────────────────────────────────────────────────
  {
    name: "Zinger Burger",
    category: catMap["burgers"],
    price: 450,
    description: "Crispy fried chicken fillet with zinger sauce, lettuce & mayo",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    isBestSeller: true,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Grilled Burger",
    category: catMap["burgers"],
    price: 380,
    description: "Juicy grilled beef patty with fresh veggies and special sauce",
    imageUrl: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Double Smash Burger",
    category: catMap["burgers"],
    price: 550,
    description: "Two smashed beef patties with cheese, pickles and HBF special sauce",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Crispy Chicken Burger",
    category: catMap["burgers"],
    price: 420,
    description: "Golden-fried chicken thigh with coleslaw, pickles and chipotle mayo",
    imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },

  // ─── PIZZAS ─────────────────────────────────────────────────────────────────
  {
    name: "Special Pizza (Small 7\")",
    category: catMap["pizzas"],
    price: 550,
    description: "Loaded with chicken, veggies, and extra cheese on our homemade base",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Special Pizza (Medium 10\")",
    category: catMap["pizzas"],
    price: 850,
    description: "Loaded with chicken, veggies, and extra cheese on our homemade base",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Special Pizza (Large 14\")",
    category: catMap["pizzas"],
    price: 1250,
    description: "Loaded with chicken, veggies, and extra cheese on our homemade base — feeds 3-4",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Chicken Tikka Pizza (Small 7\")",
    category: catMap["pizzas"],
    price: 600,
    description: "Marinated chicken tikka with capsicum, onion and mozzarella",
    imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Chicken Tikka Pizza (Medium 10\")",
    category: catMap["pizzas"],
    price: 900,
    description: "Marinated chicken tikka with capsicum, onion and mozzarella",
    imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Chicken Tikka Pizza (Large 14\")",
    category: catMap["pizzas"],
    price: 1350,
    description: "Marinated chicken tikka with capsicum, onion and mozzarella — feeds 3-4",
    imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "BBQ Beef Pizza (Medium 10\")",
    category: catMap["pizzas"],
    price: 950,
    description: "Smoky BBQ sauce, minced beef, caramelized onions, and mozzarella",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },

  // ─── FRIES & SIDES ──────────────────────────────────────────────────────────
  {
    name: "Loaded Fries (Small)",
    category: catMap["fries-sides"],
    price: 200,
    description: "Crispy fries topped with cheese sauce, jalapeños and herbs",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Loaded Fries (Medium)",
    category: catMap["fries-sides"],
    price: 280,
    description: "Crispy fries topped with cheese sauce, jalapeños and herbs",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Loaded Fries (Large)",
    category: catMap["fries-sides"],
    price: 380,
    description: "Crispy fries topped with cheese sauce, jalapeños and herbs — perfect for sharing",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Regular Fries (Small)",
    category: catMap["fries-sides"],
    price: 120,
    description: "Golden crispy fries, lightly salted",
    imageUrl: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Regular Fries (Medium)",
    category: catMap["fries-sides"],
    price: 160,
    description: "Golden crispy fries, lightly salted",
    imageUrl: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Regular Fries (Large)",
    category: catMap["fries-sides"],
    price: 220,
    description: "Golden crispy fries, lightly salted — great with any burger",
    imageUrl: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Coleslaw",
    category: catMap["fries-sides"],
    price: 90,
    description: "Creamy homemade coleslaw — the perfect side",
    imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },

  // ─── WINGS & CHICKEN ────────────────────────────────────────────────────────
  {
    name: "Crispy Wings (6 pcs)",
    category: catMap["wings-chicken"],
    price: 520,
    description: "Crispy fried chicken wings with your choice of dip",
    imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Crispy Wings (12 pcs)",
    category: catMap["wings-chicken"],
    price: 960,
    description: "Crispy fried chicken wings with your choice of dip — great for sharing",
    imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Hot & Spicy Wings (6 pcs)",
    category: catMap["wings-chicken"],
    price: 560,
    description: "Fiery hot wings marinated in our special spicy sauce",
    imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Hot & Spicy Wings (12 pcs)",
    category: catMap["wings-chicken"],
    price: 1000,
    description: "Fiery hot wings marinated in our special spicy sauce — for the brave",
    imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Chicken Strips (4 pcs)",
    category: catMap["wings-chicken"],
    price: 380,
    description: "Crispy chicken tenders served with honey mustard dip",
    imageUrl: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Chicken Strips (8 pcs)",
    category: catMap["wings-chicken"],
    price: 700,
    description: "Crispy chicken tenders served with honey mustard dip — family size",
    imageUrl: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },

  // ─── ROLLS & SANDWICHES ─────────────────────────────────────────────────────
  {
    name: "Club Sandwich",
    category: catMap["rolls-sandwiches"],
    price: 320,
    description: "Triple-decker with grilled chicken, veggies, egg and mayo",
    imageUrl: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&q=80",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Chicken Roll (Single)",
    category: catMap["rolls-sandwiches"],
    price: 250,
    description: "Soft flatbread roll with spicy chicken, onions and chutney",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Chicken Roll (Double — 2 pcs)",
    category: catMap["rolls-sandwiches"],
    price: 450,
    description: "Two soft flatbread rolls with spicy chicken, onions and chutney",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Beef Seekh Roll",
    category: catMap["rolls-sandwiches"],
    price: 280,
    description: "Juicy seekh kebab wrapped in soft naan with raita and salad",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },

  // ─── BBQ & SPECIAL ──────────────────────────────────────────────────────────
  {
    name: "BBQ Platter",
    category: catMap["bbq-special"],
    price: 1200,
    description: "Assorted BBQ including seekh kebab, tikka, and naan",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "HBF Special Meal",
    category: catMap["bbq-special"],
    price: 950,
    description: "Zinger Burger + Medium Fries + Drink — our best value combo",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Family Deal (4 Burgers + 2 Fries + 4 Drinks)",
    category: catMap["bbq-special"],
    price: 2200,
    description: "Perfect for the whole family — 4 Zinger Burgers, 2 Large Fries, and 4 cold drinks",
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },

  // ─── DRINKS ─────────────────────────────────────────────────────────────────
  {
    name: "Cold Drink (330ml)",
    category: catMap["drinks"],
    price: 90,
    description: "Pepsi, 7Up, or Mirinda — your choice",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Cold Drink (1.5L)",
    category: catMap["drinks"],
    price: 200,
    description: "Pepsi, 7Up, or Mirinda — large bottle, great for sharing",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Fresh Lemonade",
    category: catMap["drinks"],
    price: 150,
    description: "Freshly squeezed lemon with mint and soda",
    imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Mango Shake",
    category: catMap["drinks"],
    price: 180,
    description: "Thick and creamy mango milkshake made with real mango pulp",
    imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Water (500ml)",
    category: catMap["drinks"],
    price: 50,
    description: "Nestle or Aquafina mineral water",
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&q=80",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
]);

console.log("Seeding admin user...");
await AdminUser.deleteMany({});
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
await AdminUser.create({ email: ADMIN_EMAIL, passwordHash, role: "admin" });

console.log(`Admin created: ${ADMIN_EMAIL}`);
console.log("Seed complete! 🎉");
await mongoose.disconnect();
