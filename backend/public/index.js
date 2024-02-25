"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const connectDB_1 = require("./connectDB");
const admin_route_1 = __importDefault(require("./routes/admin_route"));
const volunteer_route_1 = __importDefault(require("./routes/volunteer_route"));
const client_route_1 = __importDefault(require("./routes/client_route"));
const auth_route_1 = __importDefault(require("./routes/auth_route"));
dotenv_1.default.config();
// Express setup
exports.app = (0, express_1.default)();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const port = process.env.PORT;
// Add this middleware to parse JSON request bodies
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.use("/admin", admin_route_1.default);
exports.app.use("/volunteer", volunteer_route_1.default);
exports.app.use("/client", client_route_1.default);
exports.app.use("/auth", auth_route_1.default);
(0, connectDB_1.connectDB)();
exports.app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
exports.default = exports.app;
