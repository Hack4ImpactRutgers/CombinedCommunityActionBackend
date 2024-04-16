import express, { Request, Response } from "express";
import Admin from "../schemas/admin_schema";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
import mongoose from "mongoose";

const router = express.Router();

// Route to fetch an admin by its ID
router.get("/:id", [auth, roles.admin], (req: Request, res: Response) => {
  Admin.findById(new mongoose.Types.ObjectId(req.params.id))
    .then((admin: any) => {
      if (!admin) {
        // If admin is not found, respond with a 404 status code
        return res.status(404).send({ error: "Admin not found." });
      }
      // Respond with the admin data
      res.send(admin);
    })
    .catch((err: any) => {
      // Log the error and respond with a 500 status code
      console.error(err);
      res.status(500).send({ error: "An error occurred fetching the admin." });
    });
});

export default router;
