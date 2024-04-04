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
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
describe("Middleware functions tests", () => {
    let server;
    let adminToken;
    let volunteerToken;
    let invalidToken;
    // Set up: start the server and create test tokens
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Mock a protected route
        index_1.app.post("/protected", [auth_1.default, roles_1.default.admin], (req, res) => {
            res.status(200).json("success");
        });
        // Start the server
        server = index_1.app.listen();
        // Create a test admin token
        adminToken = jsonwebtoken_1.default.sign({
            email: "testemail",
            roles: ["admin", "volunteer"]
        }, process.env.TOKEN_SECRET);
        // Create a test client token
        volunteerToken = jsonwebtoken_1.default.sign({
            email: "testemail",
            roles: ["volunteer"]
        }, process.env.TOKEN_SECRET);
        // Create an invalid token (not signed with the correct secret)
        invalidToken = jsonwebtoken_1.default.sign({
            email: "testemail",
            roles: ["admin", "volunteer"]
        }, "incorrect secret");
    }));
    // Clean up: Close the server and disconnect from the database
    afterAll((done) => {
        server.close(() => {
            mongoose_1.default.disconnect().then(() => {
                done();
            });
        });
    });
    // ADMIN AUTHENTICATION TESTS
    describe("Admin authentication tests", () => {
        it("Admins should access protected route", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/protected")
                .set("Cookie", `token=${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toBe("success");
        }));
    });
    // VOLUNTEER AUTHENTICATION TESTS
    describe("Volunteer authentication tests", () => {
        it("Volunteers should not be able to access the protected route", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/protected")
                .set("Cookie", `token=${volunteerToken}`);
            expect(response.status).toBe(403);
            expect(response.body).toBe("Unauthorized");
        }));
    });
    // INVALID TOKEN AUTHENTICATION TESTS
    describe("Invalid token authentication tests", () => {
        it("Invalid tokens should not be able to access the protected route", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/protected")
                .set("Cookie", `token=${invalidToken}`);
            expect(response.status).toBe(400);
            expect(response.body).toBe("Token is not valid");
        }));
    });
    // NO TOKEN AUTHENTICATION TESTS
    describe("No token authentication tests", () => {
        it("If a token is not provided, then we should not be able to access the protected route", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/protected");
            expect(response.status).toBe(401);
            expect(response.body).toBe("No token, authorization denied");
        }));
    });
});
