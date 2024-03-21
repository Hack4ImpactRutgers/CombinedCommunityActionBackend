import express, { Request, Response } from "express";
import Order from "../schemas/order_schema";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
const router = express.Router();

// Route to fetch an order by its ID
router.get("/:id", [auth, roles.volunteer], (req: Request, res: Response) => {
  Order.findById(req.params.id)
    .then((order: any) => {
      if (!order) {
        // If client is not found, respond with a 404 status code
        return res.status(404).send({ error: "Order not found." });
      }
      // Respond with the client data
      res.send(order);
    })
    .catch((err: any) => {
      // Log the error and respond with a 500 status code
      console.error(err);
      res.status(500).send({ error: "An error occurred fetching the order." });
    });
});

export default router;
