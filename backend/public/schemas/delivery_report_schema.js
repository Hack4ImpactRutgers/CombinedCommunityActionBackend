"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const deliveryReportSchema = new mongoose_1.default.Schema({
    // Assuming these match the fields from the delivery report input
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true },
    instructions: String,
    pets: [{
            petName: String,
            foodType: String,
            foodAmount: Number
        }],
    lasting: { type: Boolean, required: true },
    cup: Boolean,
    scale: Boolean,
    comments: String,
    supplies: { type: String, required: true },
    needs: { type: String, required: true },
    name: { type: String, required: true },
    updated: { type: Boolean, required: true },
    selectedDate: { type: Date, required: true },
    // Add the order and volunteer reference fields
    order: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Order", required: true },
    volunteer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Volunteer", required: true },
});
const DeliveryReport = mongoose_1.default.model("DeliveryReport", deliveryReportSchema);
exports.default = DeliveryReport;
