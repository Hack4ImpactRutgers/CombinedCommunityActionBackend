import mongoose from "mongoose";
import request from "supertest";
import { app } from "../index"; // Adjust the import path as needed
import { Server } from "http";
import OTP from "../schemas/otp_schema";
import EmailToBeApproved from "../schemas/emails_schema";

// Describe the test suite for Authentication and Signup Route Tests
describe("Authentication and Signup Route Tests", () => {
  let server: Server;
  let testOTP: string;

  // Before running any tests, set up the server and clear the emailsToBeApproved collection
  beforeAll(async () => {
    server = app.listen();

    // Generate an OTP for testing the login route
    const savedOTP = new OTP({ 
      email:"test@example.com", 
      otp:"54321", 
      expiresAt: new Date(Date.now() + 5 * 60000) 
    }).save();
    testOTP = (await savedOTP).otp;

    // Clear the emailsToBeApproved collection before running tests
    await EmailToBeApproved.deleteMany({});
  });

  // After all tests are done, close the server and disconnect from the database
  afterAll((done) => {
    server.close(() => {
      mongoose.disconnect().then(() => {
        done();
      });
    });
  });

  // Test suite for the Signup Route (POST /volunteer/signup)
  describe("POST /volunteer/signup", () => {
    it("should request signup and return success message", async () => {
      // Send a POST request to request signup with a new email
      const response = await request(server)
        .post("/auth/volunteer/signup")
        .send({ email: "new@example.com" });

      // Expect a successful response with a status code of 200
      // and the message "Signup request sent"
      expect(response.status).toBe(200);
      expect(response.body).toBe("Signup request sent");
    });

    it("should return an error if the email already exists", async () => {
      // Sign up with an email that already exists in the database
      await request(server)
        .post("/auth/volunteer/signup")
        .send({ email: "test@example.com" });

      // Attempt to sign up with the same email and expect an error response
      const response = await request(server)
        .post("/auth/volunteer/signup")
        .send({ email: "test@example.com" });

      // Expect an error response with a status code of 400 and the message "Email already exists"
      expect(response.status).toBe(400);
      expect(response.body).toBe("Email already exists");
    });
  });

  // Test suite for the Login Route (POST /volunteer/login)
  describe("POST /volunteer/login", () => {
    it("should log in with a valid OTP and return a JWT token", async () => {
      // TODO: Send a POST request to log in with a valid OTP
      const user_email = "test@example.com";
      // Send a POST request to generate OTP.
      const response = await request(server)
        .post("/volunteer/login")
        .send({ email: user_email, otp: testOTP });

      // Expect an error response with a status code of 200 and a specific success message.
      expect(response.status).toBe(200);
      expect(response.body).toBe("OTP verified, user logged in");
    });

    it("should return an error for invalid OTP", async () => {
      // Send a POST request to log in with an invalid OTP
      const response = await request(server)
        .post("/auth/volunteer/login")
        .send({ email: "test@example.com", otp: "invalidotp" });

      // Expect an error response with a status code of 400 and a specific error message
      expect(response.status).toBe(400);
      expect(response.body).toBe("Invalid OTP");
    });

    it("should return an error for missing email or OTP", async () => {
      // Send a POST request to log in without providing an email or OTP
      const response = await request(server)
        .post("/auth/volunteer/login")
        .send({ otp: "123456" });

      // Expect an error response with a status code of 400 and a specific error message
      expect(response.status).toBe(400);
      expect(response.body).toBe("Email and OTP required");
    });
  });

  // Test suite for the Logout Route (POST /volunteer/logout)
  describe("POST /volunteer/logout", () => {
    it("should clear the JWT token cookie and log the user out", async () => {
      // Send a POST request to log out the user
      const response = await request(server).post("/auth/volunteer/logout");

      // Expect a successful response with a status code of 200,
      // a specific success message, and the JWT token cookie being cleared
      expect(response.status).toBe(200);
      expect(response.body).toBe("User logged out");
      expect(response.headers["set-cookie"]).toBeDefined();
    });
  });
});
