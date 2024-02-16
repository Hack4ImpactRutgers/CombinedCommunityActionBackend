import request from "supertest";
import { app } from "../index";
import mongoose from "mongoose";
import { Server } from "http";
import Admin from "../schemas/admin_schema";
import Client from "../schemas/client_schema";
import Volunteer from "../schemas/volunteer_schema";
import { Request, Response, NextFunction } from "express";

// Mock the auth middleware
jest.mock("../middleware/auth", () => {
  return jest.fn((req: Request, res: Response, next: NextFunction) => next());
});

// Mock the roles middleware
jest.mock("../middleware/roles", () => {
  return {
    admin: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
    volunteer: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
    client: jest.fn((req: Request, res: Response, next: NextFunction) => next())
  };
});

describe("Express + TypeScript Server Tests", () => {
  let server: Server;
  let adminId: string;
  let clientId: string;
  let volunteerId: string;

  // Set up: Start the server and populate the database with test entries
  beforeAll(async () => {
    server = app.listen();

    const savedAdmin = await new Admin({ 
      name: "Test Admin", 
      email: "test@admin.com",
      password: "testpassword",
    }).save();
    adminId = savedAdmin._id.toString();

    const savedClient = await new Client({
      name: "Test Client",
      age: 30,
      address: "123 Test St",
      region: "Test Region",
      pets: [{ isActive: true, animal: "Dog", vet: false, food: { kind: "Bones", lbs: 2 } }]
    }).save();
    clientId = savedClient._id.toString();

    const savedVolunteer = await new Volunteer({
      isActive: true,
      name: "Test Volunteer",
      email: "test@volunteer.com",
      number: "123-456-7890"
    }).save();
    volunteerId = savedVolunteer._id.toString();

  });

  // Clean up: Close the server and disconnect from the database
  afterAll((done) => {
    server.close(async () => {
      await Admin.deleteOne({ name: "Test Admin" });
      await Admin.deleteOne({ name: "John Admin" });
      await Client.deleteOne({ name: "Test Client" });
      await Client.deleteOne({ name: "Jane Client" });
      await Volunteer.deleteOne({ name: "Test Volunteer" });

      mongoose.disconnect().then(() => {
        done();
      });
    });
  });

  // BASE ROUTE TESTS
  describe("Base Route Tests", () => {
    it("BASE ROUTE STATUS 200", async () => {
      const response = await request(server).get("/");
      expect(response.status).toBe(200);
    });

    it("BASE ROUTE WELCOME MESSAGE", async () => {
      const response = await request(server).get("/");
      expect(response.text).toBe("Express + TypeScript Server");
    });
  });

  // ADMIN ROUTE TESTS
  describe("Admin Route Tests", () => {
    it("FETCH ADMIN BY ID", async () => {
      const response = await request(server).get(`/admin/${adminId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name");
    });
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

    it("FETCH CLIENT BY ID", async () => {
      const response = await request(server).get(`/client/${clientId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name");
    });

    it("CREATE AND SAVE NEW CLIENT", async () => {
      const response = await request(server).post("/client").send(newClientData);
      expect(response.status).toBe(201);
      expect(response.body.name).toEqual(newClientData.name);
    });
  });

  // VOLUNTEER ROUTE TESTS
  describe("Volunteer Route Tests", () => {
    const newVolunteerData = {
      isActive: true,
      name: "John Volunteer",
      email: "john@volunteer.com",
      number: "987-654-3210"
    };

    it("FETCH VOLUNTEER BY ID", async () => {
      const response = await request(server).get(`/volunteer/${volunteerId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name");
    });

    it("CREATE AND SAVE NEW VOLUNTEER", async () => {
      const response = await request(server).post("/volunteer").send(newVolunteerData);
      expect(response.status).toBe(201);
      expect(response.body.name).toEqual(newVolunteerData.name);
    });

    it("SEND OTP TO VOLUNTEER EMAIL", async () => {
      const response = await request(server).post("/auth/otp/request-otp").send({
        email: "mukunda.rayden@farmoaks.com"
      });
      expect(response.status).toBe(200);
    });
  });
});