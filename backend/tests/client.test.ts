import client from "../schemas/client_schema";
import { Server } from "http";
import request from "supertest";
import Admin from "../schemas/admin_schema";
import { app } from "../index";
import mongoose from "mongoose";
import jwt, { Secret } from "jsonwebtoken";
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
/*
    client1 = new Client({
      name: "client 1",
      age: 70,
      address: "client 1 address",
      region: "region A",
      pets: ["cat 1-1", "cat 1-2"],
    });


    await client1.save();

     client2 = new Client({
      name: "client 2",
      age: 74,
      address: "client 2 address",
      region: "region A",
      pets: ["cat 2-1", "dog 2-1"],
    });

    await client2.save();
    
     client3 = new Client({
      name: "client 3",
      age: 60,
      address: "client 3 address",
      region: "region B",
      pets: ["cat 3-1"],
    });

    await client3.save();

     client4 = new Client({
      name: "client 4",
      age: 77,
      address: "client 4 address",
      region: "region C",
      pets: ["dog 4-1"],
    });

    await client4.save();
    */

  });

    // After all tests are done, close the server and disconnect from the database
  afterAll((done) => {
    server.close(() => {
      mongoose.disconnect().then(() => {
        done();
      });
    });
  });

  //

});