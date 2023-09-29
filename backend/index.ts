import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './connectDB';

dotenv.config();

// Route imports
const adminRoute = require("./routes/admin_route");
const volunteerRoute = require("./routes/volunteer_route");
const clientRoute = require("./routes/client_route")

// Express setup
const app: Express = express();
const port = process.env.PORT;

app.use("/admin", adminRoute);
app.use("/volunteer", volunteerRoute);
app.use("/client", clientRoute);

connectDB();

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});



