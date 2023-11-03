import express from "express";
import jwt, { Secret } from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../schemas/otp_schema";

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

function generateOTP() {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

router.post("/opt/request-otp", async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP(); // generaqtes a random 6 digit number

  await transport.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification",
    html: `Here is your OTP: <b>${otp}</b>. It expires in 5 minutes.`,
  }).catch((err) => console.log(`Email failed to send: ${err}`));

  const newOTP = new OTP({ email, otp }); // this expires after 5 minutes. Check the schema
  await newOTP.save();
  res.json("Email sent");
});

router.post("/login", (req, res) => {
  // check from mongoose database if the otp exists and belongs to the user
  // then set the cookie in the browser
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json("Email and OTP required");
    return;
  }
  const validOTP = OTP.findOne({ email, otp });
  if (validOTP == null) {
    res.status(400).json("Invalid OTP");
    return;
  }
  // we know that this OTP is valid
  // create a JWT token and send it to the browser
  const token = jwt.sign({ email }, TOKEN_SECRET as Secret);
  res.cookie("token", token, { httpOnly: true });
  res.json("OTP verified, user logged in");
});

router.post("/logout", (req, res) => {
  // clear the cookie in the browser
  res.clearCookie("token");
  res.json("User logged out");
});


export default router;