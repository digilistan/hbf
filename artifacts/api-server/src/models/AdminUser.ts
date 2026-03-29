import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
  role: string;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
