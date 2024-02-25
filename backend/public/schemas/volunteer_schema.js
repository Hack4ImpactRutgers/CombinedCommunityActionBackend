"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const volunteerSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, default: false },
    number: { type: String, required: true, default: false },
});
const Volunteer = mongoose_1.default.model("Volunteer", volunteerSchema);
exports.default = Volunteer;
