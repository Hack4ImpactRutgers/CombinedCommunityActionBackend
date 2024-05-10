"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const siteSchema = new mongoose_1.default.Schema({
    location: { type: String },
});
const siteLocation = mongoose_1.default.model("SiteLocation", siteSchema);
exports.default = siteLocation;
