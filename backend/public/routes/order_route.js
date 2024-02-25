"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_schema_1 = __importDefault(require("../schemas/order_schema"));
const router = express_1.default.Router();
// Route to fetch an order by its ID
router.get("/:id", (req, res) => {
    order_schema_1.default.findById(req.params.id)
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
exports.default = router;
