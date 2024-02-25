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
const admin_schema_1 = __importDefault(require("../schemas/admin_schema"));
const index_1 = require("../index");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe("Admin Registration and Authentication Tests", () => {
    let server;
    let token;
    const test_password = "test password";
    const test_email = "test@email.com";
    const test_name = "John Doe";
    // Set up: start the server and set up test admin token
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        server = index_1.app.listen();
        token = jsonwebtoken_1.default.sign({
            email: "testemail",
            roles: ["admin", "volunteer"]
        }, process.env.TOKEN_SECRET);
    }));
    // Clean up: Close the server, delete test entry, and disconnect from the database
    afterAll((done) => {
        server.close(() => {
            admin_schema_1.default.deleteOne({ name: "John Doe" }).then(() => {
                mongoose_1.default.disconnect().then(() => {
                    done();
                });
            });
        });
    });
    // ADMIN REGISTRATION TESTS
    describe("Admin registration tests", () => {
        it("Register with admin privileges and not all fields set", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/admin/register")
                .set("x-auth-token", token)
                .send({
                name: test_name,
                email: test_email
            });
            expect(response.status).toBe(400);
            expect(response.body).toBe("Please enter all fields");
        }));
        it("Register with admin privileges and all fields set", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/admin/register")
                .set("x-auth-token", token)
                .send({
                name: test_name,
                email: test_email,
                password: test_password
            });
            expect(response.status).toBe(201);
            expect(response.body).toBe("Admin successfully registered");
        }));
        it("Attempt to register an existing admin ", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/admin/register")
                .set("x-auth-token", token)
                .send({
                name: test_name,
                email: test_email,
                password: test_password
            });
            expect(response.status).toBe(400);
            expect(response.body).toBe("Admin already exists");
        }));
    });
    // ADMIN AUTHENTICATION TESTS
    describe("Admin authentication tests", () => {
        it("Login with correct credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/admin/login")
                .send({
                email: test_email,
                password: test_password
            });
            expect(response.status).toBe(200);
            expect(response.body).toBe("Password verified, admin logged in");
        }));
        it("Login with incorrect credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/admin/login")
                .send({
                email: test_email,
                password: "wrong password"
            });
            expect(response.status).toBe(400);
            expect(response.body).toBe("Invalid email or password");
        }));
        it("Login with non-existent email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/admin/login")
                .send({
                email: "wrong email",
                password: test_password
            });
            expect(response.status).toBe(400);
            expect(response.body).toBe("Invalid email or password");
        }));
    });
    // COOKIE VERIFICATION
    describe("Cookie verification tests", () => {
        it("Cookie received from successful login should be valid", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/admin/login")
                .send({
                email: test_email,
                password: test_password
            });
            const cookie = response.header["set-cookie"][0];
            let receivedToken;
            cookie.split(";").forEach((cookiePart) => {
                if (cookiePart.includes("token")) {
                    receivedToken = cookiePart.split("=")[1];
                }
            });
            const result = jsonwebtoken_1.default.verify(receivedToken, process.env.TOKEN_SECRET);
            expect(result).toBeTruthy(); // if the token is not valid, then we should get an error before getting here
        }));
    });
});
