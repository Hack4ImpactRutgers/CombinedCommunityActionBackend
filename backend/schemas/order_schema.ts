import mongoose from "mongoose";
const { Types } = mongoose;

const foodItemSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  weight: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    client: { type: Types.ObjectId, ref: "Client", required: true },
    createdOn: { type: Date },
    deliverBy: { type: Date },
    foodItem: foodItemSchema,
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
  });

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;