import express, { Request, Response } from "express";
import Admin from "../schemas/admin_schema";

const router = express.Router();

// Route to fetch an admin by its ID
router.get("/:id", (req: Request, res: Response) => {
  Admin.findById(req.params.id)
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
