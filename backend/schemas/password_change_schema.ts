import mongoose from "mongoose";

const passwordChangeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24, // expires after 24 hours
  }
});
const passwordChangeRequest = mongoose.model("passwordChangeRequest", passwordChangeSchema);

export default passwordChangeRequest;