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
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
const site_schema_1 = __importDefault(require("../schemas/site_schema"));
const router = express_1.default.Router();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get("/all", [auth_1.default, roles_1.default.volunteer], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("/site/all");
    try {
        const sites = yield site_schema_1.default.find({});
        return res.status(200).json(sites);
    }
    catch (error) {
        return res.status(400).json({ error });
    }
}));
router.delete("/:id", [auth_1.default, roles_1.default.volunteer], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleted = yield site_schema_1.default.findByIdAndDelete(id);
        res.status(200).json({ deleted });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: JSON.stringify(err) });
    }
}));
router.post("/", [auth_1.default, roles_1.default.volunteer], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { location } = req.body;
        const newSite = new site_schema_1.default({ location });
        yield newSite.save();
        res.status(200).send(newSite);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: JSON.stringify(err) });
    }
}));
exports.default = router;
