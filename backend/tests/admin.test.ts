import request from "supertest";
import Admin from "../schemas/admin_schema";
import { Server } from "http";
import { app } from "../index";
import mongoose from "mongoose";
import jwt, { Secret } from "jsonwebtoken";

describe("Admin Registration and Authentication Tests", () => {
  let server: Server;
  let token: string;
  const test_password = "test password";
  const test_email = "test@email.com";
  const test_name = "John Doe";

  // Set up: start the server and set up test admin token
  beforeAll(async () => {
    server = app.listen();

    token = jwt.sign({
      email: "testemail",
      roles: ["admin", "volunteer"]
    }, process.env.TOKEN_SECRET as Secret);
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

  // ADMIN REGISTRATION TESTS
  describe("Admin registration tests", () => {
    it("Register with admin privileges and not all fields set", async () => {
      const response = await request(server)
        .post("/auth/admin/register")
        .set("Cookie", "token=" + token)
        .send({
          name: test_name,
          email: test_email
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("Please enter all fields");
    });

    it("Register with admin privileges and all fields set", async () => {
      const response = await request(server)
        .post("/auth/admin/register")
        .set("Cookie", "token=" + token)
        .send({
          name: test_name,
          email: test_email,
          password: test_password
        });

      expect(response.status).toBe(201);
      expect(response.body).toBe("Admin successfully registered");
    });

    it("Attempt to register an existing admin ", async () => {
      const response = await request(server)
        .post("/auth/admin/register")
        .set("Cookie", "token=" + token)
        .send({
          name: test_name,
          email: test_email,
          password: test_password
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("Admin already exists");
    });
  });

  // ADMIN AUTHENTICATION TESTS
  describe("Admin authentication tests", () => {
    it("Login with correct credentials", async () => {
      const response = await request(server)
        .post("/auth/admin/login")
        .send({
          email: test_email,
          password: test_password
        });

      expect(response.status).toBe(200);
      expect(response.body).toBe("Password verified, admin logged in");
    });

    it("Login with incorrect credentials", async () => {
      const response = await request(server)
        .post("/auth/admin/login")
        .send({
          email: test_email,
          password: "wrong password"
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("Invalid email or password");
    });

    it("Login with non-existent email", async () => {
      const response = await request(server)
        .post("/auth/admin/login")
        .send({
          email: "wrong email",
          password: test_password
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("Invalid email or password");
    });
  });

  // COOKIE VERIFICATION
  describe("Cookie verification tests", () => {
    it("Cookie received from successful login should be valid", async () => {
      const response = await request(server)
        .post("/auth/admin/login")
        .send({
          email: test_email,
          password: test_password
        });

      const cookie = response.header["set-cookie"][0];
      let receivedToken: any;

      cookie.split(";").forEach((cookiePart: string) => {
        if (cookiePart.includes("token")) {
          receivedToken = cookiePart.split("=")[1];
        }
      });

      const result = jwt.verify(receivedToken, process.env.TOKEN_SECRET as Secret);
      expect(result).toBeTruthy(); // if the token is not valid, then we should get an error before getting here
    });
  });
});