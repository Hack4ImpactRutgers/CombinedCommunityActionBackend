import mongoose, { ConnectOptions } from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
import endpoint from './endpoints.config';

let dbName = "db";
let DB_URI: string = endpoint.MONGODB_URI!;
console.log(endpoint.MONGODB_URI)
// Connect to Database
module.exports = async () => {
    await mongoose
        .connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: dbName,
        } as ConnectOptions)
        .then(() => {
            console.log("🚨🚨🚨 DATABASE INITIALIZING NYOOOM 🚨🚨🚨");
        })
        .catch((err: any) => {
            console.log(err.message);
        });
};
