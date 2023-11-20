import express, { Request, Response } from "express";
import Client from "../schemas/client_schema";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
const router = express.Router();

// Route to fetch a client by its ID
router.get("/:id", (req: Request, res: Response) => {
  Client.findById(req.params.id)
    .then((client: any) => {
      if (!client) {
        // If client is not found, respond with a 404 status code
        return res.status(404).send({ error: "Client not found." });
      }
      // Respond with the client data
      res.send(client);
    })
    .catch((err: any) => {
      // Log the error and respond with a 500 status code
      console.error(err);
      res.status(500).send({ error: "An error occurred fetching the client." });
    });
});

// Route to create and save a new client
router.post("/", [auth, roles.admin], (req: Request, res: Response) => {
  const newClient = new Client(req.body);
  newClient
    .save()
    .then((client: any) => {
      // Respond with the created client data and a 201 status code
      res.status(201).send(client);
    })
    .catch((err: any) => {
      // Log the error and respond with a 400 status code
      console.error(err);
      res.status(400).send({ error: err.message });
    });
});

export default router;
