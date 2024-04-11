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
const order_route_1 = __importDefault(require("./routes/order_route"));
const delivery_route_1 = __importDefault(require("./routes/delivery_route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
// Express setup
exports.app = (0, express_1.default)();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const port = process.env.PORT;
const DEV = process.env.NODE_ENV === "DEV";
// Add this middleware to parse JSON request bodies
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)({
    credentials: true
}));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use("/admin", admin_route_1.default);
exports.app.use("/volunteer", volunteer_route_1.default);
exports.app.use("/client", client_route_1.default);
exports.app.use("/auth", auth_route_1.default);
exports.app.use("/orders", order_route_1.default);
exports.app.use("/deliveries", delivery_route_1.default);
(0, connectDB_1.connectDB)();
exports.app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
if (DEV) {
    exports.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
exports.default = exports.app;
