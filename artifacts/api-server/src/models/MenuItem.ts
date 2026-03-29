import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  price: number;
  description?: string;
  isBestSeller: boolean;
  isSpicy: boolean;
  isActive: boolean;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    isBestSeller: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
