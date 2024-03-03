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
  lasting: { type: Boolean, required: true},
  cup: Boolean,
  scale: Boolean,
  comments: String,
  supplies: { type: String, required: true },
  needs: { type: String, required: true},
  name: { type: String, required: true}, // volunteer name 
  updated: { type: Boolean, required: true },
  selectedDate: { type: Date, required: true },
  // Add the order and volunteer reference fields
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
});

const DeliveryReport = mongoose.model("DeliveryReport", deliveryReportSchema);

export default DeliveryReport;
