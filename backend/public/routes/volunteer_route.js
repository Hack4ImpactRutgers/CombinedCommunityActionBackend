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
const volunteer_schema_1 = __importDefault(require("../schemas/volunteer_schema"));
const pending_volunteer_schema_1 = __importDefault(require("../schemas/pending_volunteer_schema"));
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
const router = express_1.default.Router();
// Route to fetch a volunteer by its ID
router.get("/:id", (req, res) => {
    volunteer_schema_1.default.findById(req.params.id)
        .then((volunteer) => {
        if (!volunteer) {
            // If volunteer is not found, respond with a 404 status code
            return res.status(404).send({ error: "Volunteer not found." });
        }
        // Respond with the volunteer data
        res.send(volunteer);
    })
        .catch((err) => {
        // Log the error and respond with a 500 status code
        console.error(err);
        res.status(500).send({ error: "An error occurred fetching the volunteer." });
    });
});
//NOTE: If you uncomment this, please make sure that the tests run properly: 'npm run test'
//If the tests fail, please modify the tests to reflect the changes made here.
// Route to create and save a new volunteer into pendingVolunteer collection
router.post("/", (req, res) => {
    const newVolunteer = new pending_volunteer_schema_1.default(req.body);
    newVolunteer
        .save()
        .then((volunteer) => {
        // Respond with the created volunteer data and a 201 status code
        newVolunteer.save();
        res.status(201).send(volunteer);
    })
        .catch((err) => {
        // Log the error and respond with a 400 status code
        console.error(err);
        res.status(400).send({ error: err.message });
    });
});
//Route to move a volunteer from Pending Volunteer to Volunteer
router.post("/verify/:id", [auth_1.default, roles_1.default.admin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingVolunteer = yield (pending_volunteer_schema_1.default.findById(req.params.id));
        if (!pendingVolunteer) {
            return res.status(404).send({ error: "Invalid verification request." });
        }
        const newVolunteer = new volunteer_schema_1.default(pendingVolunteer.toObject());
        yield newVolunteer.save();
        yield pending_volunteer_schema_1.default.deleteOne({ _id: req.params.id });
        res.status(200).send(newVolunteer);
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ error: "An error occured while verifying." });
    }
}));
exports.default = router;
