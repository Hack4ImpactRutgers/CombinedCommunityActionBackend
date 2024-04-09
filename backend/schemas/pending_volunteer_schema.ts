import mongoose from "mongoose";

const pendingVolunteerSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, required: false },
    name: { type: String, required: false },
    email: { type: String, required: true, default: false },
    number: { type: String, required: false, default: false },
  });

const pendingVolunteer = mongoose.model("pendingVolunteer", pendingVolunteerSchema);

export default pendingVolunteer;