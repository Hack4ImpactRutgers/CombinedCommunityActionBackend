import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
});
// expires after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
const OTP = mongoose.model("OTP", otpSchema);
export default OTP;