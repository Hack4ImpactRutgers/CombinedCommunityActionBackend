"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_schema_1 = __importDefault(require("../schemas/client_schema"));
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
const mongoose_1 = __importDefault(require("mongoose"));
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
router.get("/:id", (req, res) => {
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
        res.status(500).send({ error: "An error occurred fetching the client." });
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
router.patch("/:id", (req, res) => {
    /**
     * Route to update a client by its ID
     * Only admin users can update clients
     * Only the fields that are provided in the request body will be updated
     * If a field is not provided, it will remain unchanged
     */
    const { id } = req.params;
    const { name, age, address, region, pets } = req.body;
    const oldClient = client_schema_1.default.findById(id);
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid client ID." });
    }
    if (!oldClient) {
        return res.status(404).send({ error: "Client not found." });
    }
    if (!name && !age && !address && !region && !pets) {
        return res.status(400).send({ error: "No client data provided." });
    }
    const newValues = {};
    if (name)
        newValues["name"] = name;
    if (age)
        newValues["age"] = age;
    if (address)
        newValues["address"] = address;
    if (region)
        newValues["region"] = region;
    if (pets)
        newValues["pets"] = pets;
    // find values of newClient that are undefined and fill it with the oldClient values
    for (const key in oldClient) {
        if (newValues[key] == undefined) {
            newValues[key] = oldClient.get(key);
        }
    }
    const updatedClient = new client_schema_1.default(newValues);
    updatedClient.validateSync();
    if (updatedClient.errors) {
        return res.status(400).send({ error: updatedClient.errors });
    }
    client_schema_1.default.findByIdAndUpdate(id, newValues).then((client) => {
        if (!client) {
            return res.status(404).send({ error: "Client not found." });
        }
        res.send(client);
    }).catch((err) => {
        res.status(500).send({ error: err });
    });
});
exports.default = router;
