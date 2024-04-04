"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_schema_1 = __importDefault(require("../schemas/admin_schema"));
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
const router = express_1.default.Router();
// Route to fetch an admin by its ID
router.get("/:id", [auth_1.default, roles_1.default.admin], (req, res) => {
    admin_schema_1.default.findById(req.params.id)
        .then((admin) => {
        if (!admin) {
            // If admin is not found, respond with a 404 status code
            return res.status(404).send({ error: "Admin not found." });
        }
        // Respond with the admin data
        res.send(admin);
    })
        .catch((err) => {
        // Log the error and respond with a 500 status code
        console.error(err);
        res.status(500).send({ error: "An error occurred fetching the admin." });
    });
});
exports.default = router;
