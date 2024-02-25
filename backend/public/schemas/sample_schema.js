"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const person = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    // Admin, Volunteer, Customer
    role: {
        type: String,
        required: true,
    }
});
module.exports = mongoose_1.default.model('person', person);
