import mongoose from "mongoose";

const deliveryReportSchema = new mongoose.Schema({
  // Assuming these match the fields from the delivery report input
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
  instructions: String,
  pets: [{
    petName: String,
    foodType: String,
    foodAmount: Number
  }],
  lasting: Number,
  cup: Number,
  scale: Number,
  comments: String,
  supplies: Boolean,
  needs: String,
  name: String, // Name of what? Assuming volunteer name here.
  updated: Boolean,
  // Add the order and volunteer reference fields
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
});

const DeliveryReport = mongoose.model("DeliveryReport", deliveryReportSchema);

export default DeliveryReport;
