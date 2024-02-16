import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const orderSchema = new mongoose.Schema(
  {
    client: { type: Types.ObjectId, ref: 'Client', required: true },
    assignedVolunteers: [{ type: Types.ObjectId, ref: 'Volunteer' }],
    createdOn: { type: Date },
    deliverBy: { type: Date },
    cost: { type: Number }
  });

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;