import jwt, { Secret } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const TOKEN_SECRET = process.env.TOKEN_SECRET;

// verifies token in request header. use as callback in conjunction with roles.js for protected routes
const auth = (req: Request, res: Response, next: NextFunction) => {
  // check for token header
  // const token = req.header("x-auth-token");
  const { token } = req.cookies;
  if (!token)
    return res.status(401).json("No token, authorization denied");

  try {
    // verify token, and add it to the request (this is how we access the token in the next function)
    const decoded = jwt.verify(token, TOKEN_SECRET as Secret);
    req.body.user = decoded;
    next();
  } catch (err) {
    // send 400 error if token is not valid
    res.status(400).json("Token is not valid");
  }
};

export default auth;