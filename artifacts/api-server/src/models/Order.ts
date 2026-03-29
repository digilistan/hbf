import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus = "NEW" | "IN_KITCHEN" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED";

export interface IOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  items: IOrderItem[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  area?: string;
  notes?: string;
  paymentMethod: string;
  status: OrderStatus;
  total: number;
  customerId?: mongoose.Types.ObjectId;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    items: { type: [OrderItemSchema], required: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerAddress: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    notes: { type: String, trim: true },
    paymentMethod: { type: String, default: "Cash on Delivery" },
    status: {
      type: String,
      enum: ["NEW", "IN_KITCHEN", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"],
      default: "NEW",
    },
    total: { type: Number, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
