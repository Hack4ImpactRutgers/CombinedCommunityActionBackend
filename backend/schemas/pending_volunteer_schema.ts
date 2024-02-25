import mongoose from "mongoose";

const pendingVolunteerSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, default: false },
    number: { type: String, required: true, default: false },
  });

const pendingVolunteer = mongoose.model("pendingVolunteer", pendingVolunteerSchema);

export default pendingVolunteer;