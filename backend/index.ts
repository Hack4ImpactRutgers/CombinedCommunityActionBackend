import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
// DB imports
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;

// Connect to Database
let dbName = "db";
const account = async () => {
  await mongoose
    .connect(process.env.MONGODB_URI, {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName,
    })
    .then(() => {
      console.log("🚨🚨🚨 DATABASE INITIALIZING NYOOOM 🚨🚨🚨");
    })
    .catch((err: any) => {
      console.log(err.message);
    });
};


// Express setup
const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
