"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Types } = mongoose_1.default;
const foodItemSchema = new mongoose_1.default.Schema({
    brand: { type: String, required: true },
    weight: { type: Number, required: true }
});
const orderSchema = new mongoose_1.default.Schema({
    client: { type: Types.ObjectId, ref: "Client", required: true },
    createdOn: { type: Date },
    deliverBy: { type: Date },
    foodItem: foodItemSchema,
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
});
const orderModel = mongoose_1.default.model("order", orderSchema);
exports.default = orderModel;
