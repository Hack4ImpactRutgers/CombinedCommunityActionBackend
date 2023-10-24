import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./connectDB";
import adminRoute from "./routes/admin_route";
import volunteerRoute from "./routes/volunteer_route";
import clientRoute from "./routes/client_route";

dotenv.config();


// Express setup
export const app: Express = express();
const port = process.env.PORT;

app.use("/admin", adminRoute);
app.use("/volunteer", volunteerRoute);
app.use("/client", clientRoute);

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

