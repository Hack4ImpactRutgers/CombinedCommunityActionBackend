import { Request, Response, NextFunction } from "express";

//use this function as a callback for a route that requires admin privileges
const admin = (req: Request, res: Response, next: NextFunction) => {
  if(req.body.user.roles.includes("admin")) {
    next();
  } else {
    res.status(403).json("Unauthorized");
  }
};

//use this function as a callback for a route that requires volunteer privileges
const volunteer = (req: Request, res: Response, next: NextFunction) => {
  if(req.body.user.roles.includes("volunteer") || req.body.user.roles.includes("admin")) {
    next();
  } else {
    res.status(403).json("Unauthorized");
  }
};

const roles = { admin, volunteer };
export default roles;

