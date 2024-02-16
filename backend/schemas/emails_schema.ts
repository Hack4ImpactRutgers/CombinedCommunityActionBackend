import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

const EmailToBeApproved = mongoose.model(
  "EmailToBeApproved",
  emailSchema,
  "emailsToBeApproved"
);

export default EmailToBeApproved;