import client from "../schemas/client_schema";
import { Server } from "http";
import request from "supertest";
import Admin from "../schemas/admin_schema";
import { app } from "../index";
import mongoose from "mongoose";
import jwt, { Secret } from "jsonwebtoken";

// Describbe the test suite for client id routes
describe("Client ID Routes", () => {
  let server: Server;
  let token: string;
  let admin: any;
  let client1: any;
  let client2: any;
  let client3: any;
  let client4: any;

  // Before all tests, create a new admin user and 4 client documents
  beforeAll(async () => {
    server = app.listen();
    admin = new Admin({
      email: ""});
    await admin.save();
  });
});