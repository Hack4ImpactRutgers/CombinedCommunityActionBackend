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
const client_schema_1 = __importDefault(require("../schemas/client_schema"));
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
const router = express_1.default.Router();
router.get("/all", (req, res) => {
    client_schema_1.default.find()
        .then((clients) => {
        res.send(clients);
    })
        .catch((err) => {
        console.error(err);
        res.status(500).send({ error: "An error occurred fetching the clients." });
    });
});
// Route to fetch a client by its ID
router.get("/:id", [auth_1.default, roles_1.default.admin], (req, res) => {
    client_schema_1.default.findById(req.params.id)
        .then((client) => {
        if (!client) {
            // If client is not found, respond with a 404 status code
            return res.status(404).send({ error: "Client not found." });
        }
        // Respond with the client data
        res.send(client);
    })
        .catch((err) => {
        // Log the error and respond with a 500 status code
        console.error(err);
        res.status(500).send({ error: "An error o ccurred fetching the client." });
    });
});
// Route to create and save a new client
router.post("/", [auth_1.default, roles_1.default.admin], (req, res) => {
    const newClient = new client_schema_1.default(req.body);
    newClient
        .save()
        .then((client) => {
        // Respond with the created client data and a 201 status code
        res.status(201).send(client);
    })
        .catch((err) => {
        // Log the error and respond with a 400 status code
        console.error(err);
        res.status(400).send({ error: err.message });
    });
});
router.patch("/:id", [auth_1.default, roles_1.default.admin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * Route to update a client by its ID
     * Only admin users can update clients
     * Only the fields that are provided in the request body will be updated
     * If a field is not provided, it will remain unchanged
     */
    const { id } = req.params;
    console.log("PATCH /client/", id);
    try {
        const result = yield client_schema_1.default.findOneAndUpdate({ _id: id }, req.body, { new: true });
        if (!result) {
            return res.status(404).send({ error: "Client not found." });
        }
        res.send(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ error: "An error occurred updating the client." });
    }
}));
exports.default = router;
