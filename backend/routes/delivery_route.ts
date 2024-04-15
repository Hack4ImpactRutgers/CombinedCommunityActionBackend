import express, { Request, Response } from "express";
import DeliveryReport from "../schemas/delivery_report_schema";
import Order from "../schemas/order_schema";
import Client from "../schemas/client_schema";
import auth from "../middleware/auth";
import roles from "../middleware/roles";

const router = express.Router();

router.post("/", [auth, roles.volunteer], async (req: Request, res: Response) => {
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
      name,
      updated,
      selectedDate,
      orderId, // This must be provided in the body to link the report to the order
      volunteerId
    } = req.body;

    // Create and save the delivery report

    const deliveryReportData: any = {
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
      name,
      updated,
      selectedDate,
      order: orderId,
    };

    if (volunteerId) {
      deliveryReportData["volunteer"] = volunteerId;
    }

    const deliveryReport = new DeliveryReport(deliveryReportData);

    await deliveryReport.save();

    // Update the order status to "successful"
    const orderStatus = "successful";
    await Order.findByIdAndUpdate(orderId, { status: orderStatus });

    // If the delivery report indicates that an update is needed, set the needsUpdate flag for the client
    if (updated) {
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


router.get("/", [auth, roles.admin], async (req: Request, res: Response) => {
  try {
    const deliveryReports = await DeliveryReport.find();
    res.send(deliveryReports);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "An error occurred fetching the delivery reports." });
  }
});

export default router;
