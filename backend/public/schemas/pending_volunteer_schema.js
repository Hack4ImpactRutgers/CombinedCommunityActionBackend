"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const pendingVolunteerSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, required: false },
    name: { type: String, required: false },
    email: { type: String, required: true, default: false },
    number: { type: String, required: false, default: false },
});
const pendingVolunteer = mongoose_1.default.model("pendingVolunteer", pendingVolunteerSchema);
exports.default = pendingVolunteer;
