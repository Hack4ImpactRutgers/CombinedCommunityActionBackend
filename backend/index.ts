import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
let connectDB = require('./connectDB');

// Express setup
const app: Express = express();
const port = process.env.PORT;

connectDB();

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});



