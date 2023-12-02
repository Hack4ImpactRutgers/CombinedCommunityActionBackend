import express, { Request, Response } from "express";
import Volunteer from "../schemas/volunteer_schema";
import PendingVolunteer from "../schemas/pending_volunteer_schema";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
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

//NOTE: If you uncomment this, please make sure that the tests run properly: 'npm run test'
//If the tests fail, please modify the tests to reflect the changes made here.

// Route to create and save a new volunteer into pendingVolunteer collection
router.post("/", (req: Request, res: Response) => {
  const newVolunteer = new PendingVolunteer(req.body);
  newVolunteer
    .save()
    .then((volunteer: any) => {
      // Respond with the created volunteer data and a 201 status code
      newVolunteer.save();
      res.status(201).send(volunteer);
    })
    .catch((err: any) => {
      // Log the error and respond with a 400 status code
      console.error(err);
      res.status(400).send({ error: err.message });
    });
});


//Route to move a volunteer from Pending Volunteer to Volunteer
router.post("/verify/:id", [auth, roles.admin], async (req: Request, res: Response)=>{
  try{
    const pendingVolunteer = await(PendingVolunteer.findById(req.params.id));

    if(!pendingVolunteer){
      return res.status(404).send({error: "Invalid verification request."});
    }

    const newVolunteer = new Volunteer(pendingVolunteer.toObject());
    await newVolunteer.save();
    await PendingVolunteer.deleteOne({ _id: req.params.id});

    res.status(200).send(newVolunteer);
  } catch (err){
    console.error(err);
    res.status(500).send({ error: "An error occured while verifying."});
  }
});

export default router;