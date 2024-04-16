import express, { Request, Response } from "express";
import Order from "../schemas/order_schema";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
const router = express.Router();
import mongoose from "mongoose";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get("/all", [auth, roles.volunteer], async (req: Request, res: Response) => {
  console.log("/orders/all");
  try {
    const orders = await Order.find({});
    res.send(orders);
  }
  catch (err) {
    console.error(err);
    res.status(500).send({ error: JSON.stringify(err) });
  }
});

// Route to fetch an order by its ID
router.get("/:id", [auth, roles.volunteer], (req: Request, res: Response) => {
  Order.findById(new mongoose.Types.ObjectId(req.params.id))
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

router.post("/", [auth, roles.admin], (req: Request, res: Response) => {
  const {
    client,
    brand,
    weight,
  } = req.body;
  console.log(req.body);
  const order = new Order(
    {
      client: new mongoose.Types.ObjectId(client),
      createdOn: new Date(),
      foodItems: [{ brand, weight }],
      stauts: "pending"
    });
  order.save()
    .then((order: any) => {
      res.send(order);
    })
    .catch((err: any) => {
      console.error(err);
      res.status(500).send({ error: JSON.stringify(err) });
    });
}
);

export default router;
