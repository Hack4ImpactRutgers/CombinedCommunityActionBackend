import express, { Request, Response } from "express";
import Volunteer from "../schemas/volunteer_schema";
const router = express.Router();
/*
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
*/

router.get("/:id", (req: Request, res: Response) => {
  Volunteer.findById(req.params.id).then(
    (volunteer: any) => {
      res.send(volunteer);
    }
  ).catch(
    (err: any) => {
      console.log(err);
      res.send("volunteer " + req.params.id);
    }
  );
});

router.post("/", /*, [auth, admin], */ (req: Request, res: Response) => {
  const newVolunteer = new Volunteer(req.body);
  newVolunteer.save().then(
    (volunteer: any) => {
      res.send(volunteer);
    }
  ).catch(
    (err: any) => {
      res.send(err);
    }
  );
});

export default router;