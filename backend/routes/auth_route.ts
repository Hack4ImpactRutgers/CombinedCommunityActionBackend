import express from "express";
import jwt, { Secret } from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../schemas/otp_schema";
import EmailToBeApproved from "../schemas/emails_schema";

const router = express.Router();
const TOKEN_SECRET = process.env.TOKEN_SECRET; 

// Nodemailer setup
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Endpoint to request signup
router.post("volunteer/signup", async (req, res) => {
  const { email } = req.body;

  // Check if the email already exists in the emailsToBeApproved collection
  const existingEmail = await EmailToBeApproved.findOne({ email });
  if (existingEmail) {
    return res.status(400).json("Email already exists");
  }

  // Save the email in the emailsToBeApproved collection
  const newEmail = new EmailToBeApproved({ email });
  await newEmail.save();
  res.json("Signup request sent");
});

// Generate a random 6 digit number
function generateOTP() {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

// Endpoint to request OTP
router.post("/otp/request-otp", async (req, res) => {
  const { email } = req.body;

  // Check if an unexpired OTP already exists
  const existingOTP = await OTP.findOne({ email, expiresAt: { $gt: new Date() } });
  if (existingOTP) {
    return res.status(429).json("An OTP is already active, please wait for it to expire.");
  }

  const otp = generateOTP(); // Generate a random 6 digit number

  try {
    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      html: `Here is your OTP: <b>${otp}</b>. It expires in 5 minutes.`,
    });

    // Save the OTP with an expiry of 5 minutes
    const newOTP = new OTP({ email, otp, expiresAt: new Date(Date.now() + 5 * 60000) });
    await newOTP.save();
    res.json("Email sent");
  } catch (err) {
    console.log(`Email failed to send: ${err}`);
    res.status(500).json("Failed to send email");
  }
});

// Endpoint to login using OTP
router.post("volunteer/login", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json("Email and OTP required");
  }

  const validOTP = await OTP.findOne({ email, otp, expiresAt: { $gt: new Date() } });
  if (!validOTP) {
    return res.status(400).json("Invalid OTP");
  }

  // Create a JWT token and send it to the browser
  const token = jwt.sign({ email }, TOKEN_SECRET as Secret, { expiresIn: "1h" }); // Set token expiry
  res.cookie("token", token, { httpOnly: true });
  res.json("OTP verified, user logged in");
});

// Endpoint to logout
router.post("volunteer/logout", (req, res) => {
  res.clearCookie("token");
  res.json("User logged out");
});

export default router;