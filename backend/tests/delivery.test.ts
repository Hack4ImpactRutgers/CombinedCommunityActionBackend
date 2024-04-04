import request from "supertest";
import express from "express";
import deliveryRoute from "../routes/delivery_route";
import DeliveryReport from "../schemas/delivery_report_schema";
import Order from "../schemas/order_schema";
import Client from "../schemas/client_schema";

// mock the express app and apply the delivery route
const app = express();
app.use(express.json());
app.use("/", deliveryRoute);

// mock the auth and roles middleware
jest.mock("../middleware/auth", () => {
  return jest.fn((req, res, next) => next());
});

jest.mock("../middleware/roles", () => {
  return {
    volunteer: jest.fn((req, res, next) => next()),
    admin: jest.fn((req, res, next) => next()),
  };
});

// mock the mongoose models
jest.mock("../schemas/delivery_report_schema");
jest.mock("../schemas/order_schema");
jest.mock("../schemas/client_schema");

describe("POST /", () => {
  it("should create a delivery report", async () => {
    const mockDeliveryReport = { save: jest.fn() };
    jest.spyOn(DeliveryReport.prototype, "save").mockImplementationOnce(() => mockDeliveryReport.save());

    const mockOrder = { client: "client-id" };
    jest.spyOn(Order, "findById").mockResolvedValue(mockOrder);
    jest.spyOn(Order, "findByIdAndUpdate").mockResolvedValue(null);
    jest.spyOn(Client, "findByIdAndUpdate").mockResolvedValue(null);

    const res = await request(app)
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
        name: "volunteer name",
        updated: true,
        selectedDate: "2024-01-01",
        orderId: "order-id",
        volunteerId: "volunteer-id",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Delivery report submitted successfully.");
    expect(mockDeliveryReport.save).toHaveBeenCalled();
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith("order-id", { status: "successful" });
    expect(Client.findByIdAndUpdate).toHaveBeenCalledWith("client-id", { needsUpdate: true });
  });

  it("should return 500 if an error occurs", async () => {
    const mockDeliveryReport = { save: jest.fn().mockRejectedValue(new Error("this error is intentional and normal do not freak out!")) };
    jest.spyOn(DeliveryReport.prototype, "save").mockImplementationOnce(() => mockDeliveryReport.save());

    const res = await request(app)
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
  });
});