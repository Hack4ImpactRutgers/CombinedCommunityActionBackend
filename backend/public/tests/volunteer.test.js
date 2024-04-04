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
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index"); // Adjust the import path as needed
const otp_schema_1 = __importDefault(require("../schemas/otp_schema"));
const pending_volunteer_schema_1 = __importDefault(require("../schemas/pending_volunteer_schema"));
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
// Describe the test suite for Authentication and Signup Route Tests
describe("Authentication and Signup Route Tests", () => {
    let server;
    let testOTP;
    // Before running any tests, set up the server and clear the emailsToBeApproved collection
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        server = index_1.app.listen();
        // Clear the pendingVolunteer collection before running tests
        yield otp_schema_1.default.deleteMany({});
        yield pending_volunteer_schema_1.default.deleteMany({});
        // Generate an OTP for testing the login route
        const savedOTP = new otp_schema_1.default({
            email: "test@example.com",
            otp: "54321",
            expiresAt: new Date(Date.now() + 5 * 60000)
        }).save();
        testOTP = (yield savedOTP).otp;
    }));
    // After all tests are done, close the server and disconnect from the database
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield otp_schema_1.default.deleteMany({});
        yield pending_volunteer_schema_1.default.deleteMany({});
        server.close(() => {
            mongoose_1.default.disconnect().then(() => {
            });
        });
    }));
    // Test suite for the Signup Route (POST /volunteer/signup)
    describe("POST /volunteer/signup", () => {
        it("should request signup and return success message", () => __awaiter(void 0, void 0, void 0, function* () {
            // Send a POST request to request signup with a new email
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/volunteer/signup")
                .send({ email: "new@example.com" });
            // Expect a successful response with a status code of 200
            // and the message "Signup request sent"
            expect(response.status).toBe(200);
            expect(response.body).toBe("Signup request sent");
        }));
        it("should return an error if the email already exists", () => __awaiter(void 0, void 0, void 0, function* () {
            // Sign up with an email that already exists in the database
            yield (0, supertest_1.default)(server)
                .post("/auth/volunteer/signup")
                .send({ email: "test@example.com" });
            // Attempt to sign up with the same email and expect an error response
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/volunteer/signup")
                .send({ email: "test@example.com" });
            // Expect an error response with a status code of 400 and the message "Email already exists"
            expect(response.status).toBe(400);
            expect(response.body).toBe("Email already exists");
        }));
    });
    // Test suite for the Login Route (POST /volunteer/login)
    describe("POST /volunteer/login", () => {
        it("should log in with a valid OTP and return a JWT token", () => __awaiter(void 0, void 0, void 0, function* () {
            // TODO: Send a POST request to log in with a valid OTP
            const user_email = "test@example.com";
            // Send a POST request to generate OTP.
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/volunteer/login")
                .send({ email: user_email, otp: testOTP });
            // Expect an error response with a status code of 200 and a specific success message.
            expect(response.status).toBe(200);
            expect(response.body).toBe("OTP verified, user logged in");
        }));
        it("should return an error for invalid OTP", () => __awaiter(void 0, void 0, void 0, function* () {
            // Send a POST request to log in with an invalid OTP
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/volunteer/login")
                .send({ email: "test@example.com", otp: "invalidotp" });
            // Expect an error response with a status code of 400 and a specific error message
            expect(response.status).toBe(400);
            expect(response.body).toBe("Invalid OTP");
        }));
        it("should return an error for missing email or OTP", () => __awaiter(void 0, void 0, void 0, function* () {
            // Send a POST request to log in without providing an email or OTP
            const response = yield (0, supertest_1.default)(server)
                .post("/auth/volunteer/login")
                .send({ otp: "123456" });
            // Expect an error response with a status code of 400 and a specific error message
            expect(response.status).toBe(400);
            expect(response.body).toBe("Email and OTP required");
        }));
    });
    // Test suite for the Logout Route (POST /volunteer/logout)
    describe("POST /volunteer/logout", () => {
        it("should clear the JWT token cookie and log the user out", () => __awaiter(void 0, void 0, void 0, function* () {
            // Send a POST request to log out the user
            const response = yield (0, supertest_1.default)(server).post("/auth/volunteer/logout");
            // Expect a successful response with a status code of 200,
            // a specific success message, and the JWT token cookie being cleared
            expect(response.status).toBe(200);
            expect(response.body).toBe("User logged out");
            expect(response.headers["set-cookie"]).toBeDefined();
        }));
    });
});
