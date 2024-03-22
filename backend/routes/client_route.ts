import express, { Request, Response } from "express";
import Client from "../schemas/client_schema";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
import mongoose from "mongoose";
const router = express.Router();

router.get("/all", (req: Request, res: Response) => {
  Client.find()
    .then((clients: any) => {
      res.send(clients);
    })
    .catch((err: any) => {
      console.error(err);
      res.status(500).send({ error: "An error occurred fetching the clients." });
    });
});

// Route to fetch a client by its ID
router.get("/:id", [auth, roles.admin], (req: Request, res: Response) => {
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
      res.status(500).send({ error: "An error o ccurred fetching the client." });
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


router.patch("/:id", [auth, roles.admin], (req: Request, res: Response) => {
  /**
   * Route to update a client by its ID
   * Only admin users can update clients
   * Only the fields that are provided in the request body will be updated
   * If a field is not provided, it will remain unchanged
   */

  const { id } = req.params;
  const { name, age, address, region, pets } = req.body;

  const oldClient = Client.findById(id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: "Invalid client ID." });
  }
  if (!oldClient) {
    return res.status(404).send({ error: "Client not found." });
  }
  if (!name && !age && !address && !region && !pets) {
    return res.status(400).send({ error: "No client data provided." });
  }

  const newValues: { name?: string, age?: number, address?: string, region?: string, pets?: any[], [key: string]: any } = {};
  if (name) newValues["name"] = name;
  if (age) newValues["age"] = age;
  if (address) newValues["address"] = address;
  if (region) newValues["region"] = region;
  if (pets) newValues["pets"] = pets;

  // find values of newClient that are undefined and fill it with the oldClient values
  for (const key in oldClient) {
    if (newValues[key] == undefined) {
      newValues[key] = oldClient.get(key);
    }
  }

  const updatedClient = new Client(newValues);
  updatedClient.validateSync();
  if (updatedClient.errors) {
    return res.status(400).send({ error: updatedClient.errors });
  }

  Client.findByIdAndUpdate(id, newValues).then((client: any) => {
    if (!client) {
      return res.status(404).send({ error: "Client not found." });
    }
    res.send(client);
  }
  ).catch((err: any) => {
    res.status(500).send({ error: err });
  });
});

export default router;
