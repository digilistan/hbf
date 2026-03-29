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

console.log("Seeding menu items...");
await MenuItem.deleteMany({});
await MenuItem.insertMany([
  {
    name: "Zinger Burger",
    category: catMap["burgers"],
    price: 450,
    description: "Crispy fried chicken fillet with zinger sauce, lettuce & mayo",
    isBestSeller: true,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Grilled Burger",
    category: catMap["burgers"],
    price: 380,
    description: "Juicy grilled beef patty with fresh veggies and special sauce",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Double Smash Burger",
    category: catMap["burgers"],
    price: 550,
    description: "Two smashed beef patties with cheese, pickles and HBF special sauce",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Special Pizza",
    category: catMap["pizzas"],
    price: 850,
    description: "Loaded with chicken, veggies, and extra cheese on our homemade base",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Chicken Tikka Pizza",
    category: catMap["pizzas"],
    price: 900,
    description: "Marinated chicken tikka with capsicum, onion and mozzarella",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Loaded Fries",
    category: catMap["fries-sides"],
    price: 280,
    description: "Crispy fries topped with cheese sauce, jalapeños and herbs",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Regular Fries",
    category: catMap["fries-sides"],
    price: 160,
    description: "Golden crispy fries, lightly salted",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Crispy Wings (6 pcs)",
    category: catMap["wings-chicken"],
    price: 520,
    description: "Crispy fried chicken wings with your choice of dip",
    isBestSeller: true,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Hot & Spicy Wings (6 pcs)",
    category: catMap["wings-chicken"],
    price: 560,
    description: "Fiery hot wings marinated in our special spicy sauce",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "Club Sandwich",
    category: catMap["rolls-sandwiches"],
    price: 320,
    description: "Triple-decker with grilled chicken, veggies, egg and mayo",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Chicken Roll",
    category: catMap["rolls-sandwiches"],
    price: 250,
    description: "Soft flatbread roll with spicy chicken, onions and chutney",
    isBestSeller: false,
    isSpicy: true,
    isActive: true,
  },
  {
    name: "BBQ Platter",
    category: catMap["bbq-special"],
    price: 1200,
    description: "Assorted BBQ including seekh kebab, tikka, and naan",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "HBF Special Meal",
    category: catMap["bbq-special"],
    price: 950,
    description: "Zinger Burger + Fries + Drink — best value combo",
    isBestSeller: true,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Cold Drink (330ml)",
    category: catMap["drinks"],
    price: 90,
    description: "Pepsi, 7Up, or Mirinda — your choice",
    isBestSeller: false,
    isSpicy: false,
    isActive: true,
  },
  {
    name: "Fresh Lemonade",
    category: catMap["drinks"],
    price: 150,
    description: "Freshly squeezed lemon with mint and soda",
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
console.log("Seed complete!");
await mongoose.disconnect();
