import express, { Request, Response } from "express";
import DeliveryReport from "../schemas/delivery_report_schema";
import Order from "../schemas/order_schema";
import Client from "../schemas/client_schema";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/", [auth], async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phone,
      instructions,
      pets,
      lasting,
      cup,
      scale,
      comments,
      supplies,
      needs,
      updated,
      orderId, // This must be provided in the body to link the report to the order
      volunteerId // This must be provided in the body to link the report to the volunteer
    } = req.body;

    // Create and save the delivery report
    const deliveryReport = new DeliveryReport({
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phone,
      instructions,
      pets,
      lasting,
      cup,
      scale,
      comments,
      supplies,
      needs,
      updated,
      order: orderId,
      volunteer: volunteerId
    });

    await deliveryReport.save();

    // Update the order status based on the 'updated' field in the delivery report
    const orderStatus = updated ? "successful" : "failed";
    await Order.findByIdAndUpdate(orderId, { status: orderStatus });

    // If the delivery report indicates that an update is needed, set the needsUpdate flag for the client
    if (needs) {
      const order = await Order.findById(orderId);
      if (order && order.client) {
        await Client.findByIdAndUpdate(order.client, { needsUpdate: true });
      }
    }

    res.status(201).json({ message: "Delivery report submitted successfully.", deliveryReport });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "An error occurred while submitting the delivery report." });
  }
});

export default router;
