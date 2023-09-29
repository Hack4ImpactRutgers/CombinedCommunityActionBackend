import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {}
);

module.exports = mongoose.model("admin", adminSchema);
