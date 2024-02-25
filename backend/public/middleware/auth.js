"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const TOKEN_SECRET = process.env.TOKEN_SECRET;
// verifies token in request header. use as callback in conjunction with roles.js for protected routes
const auth = (req, res, next) => {
    // check for token header
    const token = req.header("x-auth-token");
    if (!token)
        return res.status(401).json("No token, authorization denied");
    try {
        // verify token, and add it to the request (this is how we access the token in the next function)
        const decoded = jsonwebtoken_1.default.verify(token, TOKEN_SECRET);
        req.body.user = decoded;
        next();
    }
    catch (err) {
        // send 400 error if token is not valid
        res.status(400).json("Token is not valid");
    }
};
exports.default = auth;
