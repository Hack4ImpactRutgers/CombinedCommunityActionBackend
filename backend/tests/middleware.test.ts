import request from "supertest";
import { Server } from "http";
import jwt, { Secret } from "jsonwebtoken";
import { app } from "../index";
import mongoose from "mongoose";
import Admin from "../schemas/admin_schema";

describe("Middleware functions tests", () => {
  let server: Server;
  let adminToken: string;
  let volunteerToken: string;
  let invalidToken: string;

  // Set up: start the server and create test tokens
  beforeAll(async () => {
    // Start the server
    server = app.listen();

    // Create a test admin token
    adminToken = jwt.sign({ 
      email: "testemail",
      roles: ["admin", "volunteer"]
    }, process.env.TOKEN_SECRET as Secret);

    // Create a test client token
    volunteerToken = jwt.sign({ 
      email: "testemail",
      roles: ["volunteer"]
    }, process.env.TOKEN_SECRET as Secret);

    // Create an invalid token (not signed with the correct secret)
    invalidToken = jwt.sign({
      email: "testemail",
      roles: ["admin", "volunteer"]
    }, "incorrect secret");
  });


  // Clean up: Close the server, delete test entry, and disconnect from the database
  afterAll((done) => {
    server.close(() => {
      Admin.deleteOne({ name: "John Doe" }).then(() => {
        mongoose.disconnect().then(() => {
          done();
        });
      });
    });
  });

  // ADMIN AUTHENTICATION TESTS
  describe("Admin authentication tests", () => {
    it("Admins should be able to create new admins", async () => {
      const response = await request(server)
        .post("/admin")
        .set("x-auth-token", adminToken)
        .send({ name: "John Doe" });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("John Doe");
    });
  });

  // VOLUNTEER AUTHENTICATION TESTS
  describe("Volunteer authentication tests", () => {
    it("Volunteers should not be able to create new admins", async () => {
      const response = await request(server)
        .post("/admin")
        .set("x-auth-token", volunteerToken)
        .send({ name: "John Doe" });

      expect(response.status).toBe(403);
      expect(response.body).toBe("Unauthorized");
    });
  });

  // INVALID TOKEN AUTHENTICATION TESTS
  describe("Invalid token authentication tests", () => {
    it("Invalid tokens should not be able to create new admins", async () => {
      const response = await request(server)
        .post("/admin")
        .set("x-auth-token", invalidToken)
        .send({ name: "John Doe" });
      
      expect(response.status).toBe(400);
      expect(response.body).toBe("Token is not valid");
    });
  });

  // NO TOKEN AUTHENTICATION TESTS
  describe("No token authentication tests", () => {
    it("If a token is not provided, then we should not be able to create new admins", async () => {
      const response = await request(server)
        .post("/admin")
        .send({ name: "John Doe" });
      
      expect(response.status).toBe(401);
      expect(response.body).toBe("No token, authorization denied");
    });
  });

});