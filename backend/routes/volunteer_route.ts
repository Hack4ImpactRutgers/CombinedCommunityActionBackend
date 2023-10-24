import express, { Request, Response } from "express";
import Volunteer from "../schemas/volunteer_schema";
const router = express.Router();

// Route to fetch a volunteer by its ID
router.get("/:id", (req: Request, res: Response) => {
  Volunteer.findById(req.params.id)
    .then((volunteer: any) => {
      if (!volunteer) {
        // If volunteer is not found, respond with a 404 status code
        return res.status(404).send({ error: "Volunteer not found." });
      }
      // Respond with the volunteer data
      res.send(volunteer);
    })
    .catch((err: any) => {
      // Log the error and respond with a 500 status code
      console.error(err);
      res.status(500).send({ error: "An error occurred fetching the volunteer." });
    });
});

// Route to create and save a new volunteer
router.post("/", /* [auth, admin], */ (req: Request, res: Response) => {
  console.log("Request Body:", req.body);
  const newVolunteer = new Volunteer(req.body);
  newVolunteer
    .save()
    .then((volunteer: any) => {
      // Respond with the created volunteer data and a 201 status code
      res.status(201).send(volunteer);
    })
    .catch((err: any) => {
      // Log the error and respond with a 400 status code
      console.error(err);
      res.status(400).send({ error: err.message });
    });
});

export default router;