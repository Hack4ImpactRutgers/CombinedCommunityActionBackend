import request from "supertest";
import { app } from "../index";
import mongoose from "mongoose";
import { Server } from "http"; // Import the Server type

describe("GET /", () => {
  let server: Server; // Explicitly type the server variable

  // Start the server before running tests
  beforeAll(() => {
    server = app.listen(); // This will dynamically allocate a port
  });

  // Close the server and database connection after tests are done
  afterAll((done) => {
    server.close(() => {
      mongoose.disconnect().then(() => {
        done();
      });
    });
  });

  it("should return 200 OK", async () => {
    const response = await request(server).get("/");
    expect(response.status).toBe(200);
  });

  it("should return 'Express + TypeScript Server'", async () => {
    const response = await request(server).get("/");
    expect(response.text).toBe("Express + TypeScript Server");
  });
});
