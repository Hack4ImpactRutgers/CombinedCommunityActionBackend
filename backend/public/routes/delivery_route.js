"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const delivery_report_schema_1 = __importDefault(require("../schemas/delivery_report_schema"));
const order_schema_1 = __importDefault(require("../schemas/order_schema"));
const client_schema_1 = __importDefault(require("../schemas/client_schema"));
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
const router = express_1.default.Router();
router.post("/", [auth_1.default, roles_1.default.volunteer], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, address, city, zipCode, phone, instructions, pets, lasting, cup, scale, comments, supplies, needs, name, updated, selectedDate, orderId, // This must be provided in the body to link the report to the order
        volunteerId // This must be provided in the body to link the report to the volunteer
         } = req.body;
        // Create and save the delivery report
        const deliveryReport = new delivery_report_schema_1.default({
            firstName,
            lastName,
            address,
            city,
            zipCode,
            phone,
            instructions,
            pets,
            lasting,
            cup,
            scale,
            comments,
            supplies,
            needs,
            name,
            updated,
            selectedDate,
            order: orderId,
            volunteer: volunteerId
        });
        yield deliveryReport.save();
        // Update the order status to "successful"
        const orderStatus = "successful";
        yield order_schema_1.default.findByIdAndUpdate(orderId, { status: orderStatus });
        // If the delivery report indicates that an update is needed, set the needsUpdate flag for the client
        if (updated) {
            const order = yield order_schema_1.default.findById(orderId);
            if (order && order.client) {
                yield client_schema_1.default.findByIdAndUpdate(order.client, { needsUpdate: true });
            }
        }
        res.status(201).json({ message: "Delivery report submitted successfully.", deliveryReport });
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ error: "An error occurred while submitting the delivery report." });
    }
}));
router.get("/", [auth_1.default, roles_1.default.admin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deliveryReports = yield delivery_report_schema_1.default.find();
        res.send(deliveryReports);
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ error: "An error occurred fetching the delivery reports." });
    }
}));
exports.default = router;
