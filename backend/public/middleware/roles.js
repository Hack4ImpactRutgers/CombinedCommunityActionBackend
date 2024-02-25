"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//use this function as a callback for a route that requires admin privileges
const admin = (req, res, next) => {
    if (req.body.user.roles.includes("admin")) {
        next();
    }
    else {
        res.status(403).json("Unauthorized");
    }
};
//use this function as a callback for a route that requires volunteer privileges
const volunteer = (req, res, next) => {
    if (req.body.user.roles.includes("volunteer") || req.body.user.roles.includes("admin")) {
        next();
    }
    else {
        res.status(403).json("Unauthorized");
    }
};
const roles = { admin, volunteer };
exports.default = roles;
