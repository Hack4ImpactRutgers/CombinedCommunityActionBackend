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
const order_schema_1 = __importDefault(require("../schemas/order_schema"));
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
const router = express_1.default.Router();
const mongoose_1 = __importDefault(require("mongoose"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get("/all", [auth_1.default, roles_1.default.volunteer], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("/orders/all");
    try {
        const orders = yield order_schema_1.default.find({});
        res.send(orders);
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ error: JSON.stringify(err) });
    }
}));
// Route to fetch an order by its ID
router.get("/:id", [auth_1.default, roles_1.default.volunteer], (req, res) => {
    order_schema_1.default.findById(new mongoose_1.default.Types.ObjectId(req.params.id))
        .then((order) => {
        if (!order) {
            // If client is not found, respond with a 404 status code
            return res.status(404).send({ error: "Order not found." });
        }
        // Respond with the client data
        res.send(order);
    })
        .catch((err) => {
        // Log the error and respond with a 500 status code
        console.error(err);
        res.status(500).send({ error: "An error occurred fetching the order." });
    });
});
router.post("/", [auth_1.default, roles_1.default.admin], (req, res) => {
    const { client, deliverBy, foodItems, } = req.body;
    const order = new order_schema_1.default({
        client: new mongoose_1.default.Types.ObjectId(client),
        createdOn: new Date(),
        deliverBy,
        foodItems,
        stauts: "pending"
    });
    order.save()
        .then((order) => {
        res.send(order);
    })
        .catch((err) => {
        console.error(err);
        res.status(500).send({ error: JSON.stringify(err) });
    });
});
exports.default = router;
