import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, default: false },
    number: { type: String, required: true, default: false },
  });

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;