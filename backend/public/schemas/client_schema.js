"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.petSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const petSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, required: true },
    animal: { type: String, required: true },
    vet: { type: Boolean, required: true, default: false },
    food: {
        kind: String,
        lbs: Number
    },
    name: String,
    age: Number,
    description: String,
    weight: String,
    diet: String
}, { _id: false });
exports.petSchema = petSchema;
const clientSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    age: Number,
    email: String,
    phone: String,
    address: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    region: String,
    pets: [petSchema],
    needsUpdate: { type: Boolean, default: false },
});
const Client = mongoose_1.default.model("Client", clientSchema);
exports.Client = Client;
exports.default = Client;
