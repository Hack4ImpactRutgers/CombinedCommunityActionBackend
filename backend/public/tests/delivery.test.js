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
const express_1 = __importDefault(require("express"));
const delivery_route_1 = __importDefault(require("../routes/delivery_route"));
const delivery_report_schema_1 = __importDefault(require("../schemas/delivery_report_schema"));
const order_schema_1 = __importDefault(require("../schemas/order_schema"));
const client_schema_1 = __importDefault(require("../schemas/client_schema"));
// mock the express app and apply the delivery route
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/", delivery_route_1.default);
// mock the auth and roles middleware
jest.mock("../middleware/auth", () => {
    return jest.fn((req, res, next) => next());
});
jest.mock("../middleware/roles", () => {
    return {
        volunteer: jest.fn((req, res, next) => next()),
    };
});
// mock the mongoose models
jest.mock("../schemas/delivery_report_schema");
jest.mock("../schemas/order_schema");
jest.mock("../schemas/client_schema");
describe("POST /", () => {
    it("should create a delivery report", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDeliveryReport = { save: jest.fn() };
        jest.spyOn(delivery_report_schema_1.default.prototype, "save").mockImplementationOnce(() => mockDeliveryReport.save());
        const mockOrder = { client: "client-id" };
        jest.spyOn(order_schema_1.default, "findById").mockResolvedValue(mockOrder);
        jest.spyOn(order_schema_1.default, "findByIdAndUpdate").mockResolvedValue(null);
        jest.spyOn(client_schema_1.default, "findByIdAndUpdate").mockResolvedValue(null);
        const res = yield (0, supertest_1.default)(app)
            .post("/")
            .send({
            firstName: "John",
            lastName: "Doe",
            address: "123 Main St",
            city: "Anytown",
            zipCode: "12345",
            phone: "123-456-7890",
            instructions: "Leave at front door",
            pets: [{ petName: "George", foodType: "Purina Gourmet Jumbo", foodAmount: 10 }],
            lasting: true,
            cup: "large",
            scale: "25 lbs",
            comments: "Cat is fat. Could use some exercise and a maybe a diet.",
            supplies: "Extra large cat bed",
            needs: "Vet visit for cat about potential weight loss.",
            updated: true,
            selectedDate: "2024-01-01",
            orderId: "order-id",
            volunteerId: "volunteer-id",
        });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Delivery report submitted successfully.");
        expect(mockDeliveryReport.save).toHaveBeenCalled();
        expect(order_schema_1.default.findByIdAndUpdate).toHaveBeenCalledWith("order-id", { status: "successful" });
        expect(client_schema_1.default.findByIdAndUpdate).toHaveBeenCalledWith("client-id", { needsUpdate: true });
    }));
    it("should return 500 if an error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDeliveryReport = { save: jest.fn().mockRejectedValue(new Error("this error is intentional and normal do not freak out!")) };
        jest.spyOn(delivery_report_schema_1.default.prototype, "save").mockImplementationOnce(() => mockDeliveryReport.save());
        const res = yield (0, supertest_1.default)(app)
            .post("/")
            .send({
            firstName: "John",
            lastName: "Doe",
            address: "123 Main St",
            city: "Anytown",
            zipCode: "12345",
            phone: "123-456-7890",
            instructions: "Leave at front door",
            pets: [{ petName: "George", foodType: "Purina Gourmet Jumbo", foodAmount: 10 }],
            lasting: true,
            cup: "large",
            scale: "25 lbs",
            comments: "Cat is fat. Could use some exercise and a maybe a diet.",
            supplies: "Extra large cat bed",
            needs: "Vet visit for cat about weight loss.",
            updated: true,
            selectedDate: "2024-01-01",
            orderId: "order-id",
            volunteerId: "volunteer-id",
        });
        expect(res.status).toBe(500);
        expect(res.body.error).toBe("An error occurred while submitting the delivery report.");
    }));
});
