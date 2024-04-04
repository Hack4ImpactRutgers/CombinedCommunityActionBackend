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
const index_1 = require("../index");
const mongoose_1 = __importDefault(require("mongoose"));
const admin_schema_1 = __importDefault(require("../schemas/admin_schema"));
const client_schema_1 = __importDefault(require("../schemas/client_schema"));
const volunteer_schema_1 = __importDefault(require("../schemas/volunteer_schema"));
// Mock the auth middleware
jest.mock("../middleware/auth", () => {
    return jest.fn((req, res, next) => next());
});
// Mock the roles middleware
jest.mock("../middleware/roles", () => {
    return {
        admin: jest.fn((req, res, next) => next()),
        volunteer: jest.fn((req, res, next) => next()),
        client: jest.fn((req, res, next) => next())
    };
});
describe("Express + TypeScript Server Tests", () => {
    let server;
    let adminId;
    let clientId;
    let volunteerId;
    // Set up: Start the server and populate the database with test entries
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        server = index_1.app.listen();
        const savedAdmin = yield new admin_schema_1.default({
            name: "Test Admin",
            email: "test@admin.com",
            password: "testpassword",
        }).save();
        adminId = savedAdmin._id.toString();
        const savedClient = yield new client_schema_1.default({
            name: "Test Client",
            age: 30,
            address: "123 Test St",
            region: "Test Region",
            pets: [{ isActive: true, animal: "Dog", vet: false, food: { kind: "Bones", lbs: 2 } }]
        }).save();
        clientId = savedClient._id.toString();
        const savedVolunteer = yield new volunteer_schema_1.default({
            isActive: true,
            name: "Test Volunteer",
            email: "test@volunteer.com",
            number: "123-456-7890"
        }).save();
        volunteerId = savedVolunteer._id.toString();
    }));
    // Clean up: Close the server and disconnect from the database
    afterAll((done) => {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield admin_schema_1.default.deleteOne({ name: "Test Admin" });
            yield admin_schema_1.default.deleteOne({ name: "John Admin" });
            yield client_schema_1.default.deleteOne({ name: "Test Client" });
            yield client_schema_1.default.deleteOne({ name: "Jane Client" });
            yield volunteer_schema_1.default.deleteOne({ name: "Test Volunteer" });
            mongoose_1.default.disconnect().then(() => {
                done();
            });
        }));
    });
    // BASE ROUTE TESTS
    describe("Base Route Tests", () => {
        it("BASE ROUTE STATUS 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).get("/");
            expect(response.status).toBe(200);
        }));
        it("BASE ROUTE WELCOME MESSAGE", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).get("/");
            expect(response.text).toBe("Express + TypeScript Server");
        }));
    });
    // ADMIN ROUTE TESTS
    describe("Admin Route Tests", () => {
        it("FETCH ADMIN BY ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).get(`/admin/${adminId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("name");
        }));
    });
    // CLIENT ROUTE TESTS
    describe("Client Route Tests", () => {
        const newClientData = {
            name: "Jane Client",
            age: 28,
            address: "456 Client Rd",
            region: "Client Region",
            pets: [{ isActive: true, animal: "Cat", vet: true, food: { kind: "Fish", lbs: 1 } }]
        };
        it("FETCH CLIENT BY ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).get(`/client/${clientId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("name");
        }));
        it("CREATE AND SAVE NEW CLIENT", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).post("/client").send(newClientData);
            expect(response.status).toBe(201);
            expect(response.body.name).toEqual(newClientData.name);
        }));
        it("UPDATE CLIENT BY ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).patch(`/client/${clientId}`).send({ name: "Jane Client Updated" });
            expect(response.status).toBe(200);
            expect(response.body.name).toEqual("Jane Client Updated");
            // update client by a field that does not exist and expect no change in the client
            const response2 = yield (0, supertest_1.default)(server).patch(`/client/${clientId}`).send({ invalidField: "Invalid Field" });
            expect(response2.body.invalidField).toBeUndefined();
        }));
    });
    // VOLUNTEER ROUTE TESTS
    describe("Volunteer Route Tests", () => {
        const newVolunteerData = {
            isActive: true,
            name: "John Volunteer",
            email: "john@volunteer.com",
            number: "987-654-3210"
        };
        it("FETCH VOLUNTEER BY ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).get(`/volunteer/${volunteerId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("name");
        }));
        it("CREATE AND SAVE NEW VOLUNTEER", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).post("/volunteer").send(newVolunteerData);
            expect(response.status).toBe(201);
            expect(response.body.name).toEqual(newVolunteerData.name);
        }));
        it("SEND OTP TO VOLUNTEER EMAIL", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server).post("/auth/otp/request-otp").send({
                email: "mukunda.rayden@farmoaks.com"
            });
            expect(response.status).toBe(200);
        }));
    });
});
