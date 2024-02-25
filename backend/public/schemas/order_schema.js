"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, Types } = mongoose_1.default;
const orderSchema = new mongoose_1.default.Schema({
    client: { type: Types.ObjectId, ref: 'Client', required: true },
    assignedVolunteers: [{ type: Types.ObjectId, ref: 'Volunteer' }],
    createdOn: { type: Date },
    deliverBy: { type: Date },
    cost: { type: Number }
});
const orderModel = mongoose_1.default.model("order", orderSchema);
exports.default = orderModel;
