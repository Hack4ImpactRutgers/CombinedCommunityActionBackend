import express from "express";
import jwt, { Secret } from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../schemas/otp_schema";
import EmailToBeApproved from "../schemas/emails_schema";
import Admin from "../schemas/admin_schema";
import bcrypt from "bcryptjs";

const router = express.Router();

// Load the secret key for JWT token from environment variables
const TOKEN_SECRET = process.env.TOKEN_SECRET;

// Setup Nodemailer to send emails using a Gmail account
const transport = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  }
});

/**
 * Endpoint to request volunteer signup.
 * 
 * This route handles signup requests by checking if the provided email
 * already exists in the emailsToBeApproved collection and saving it if not.
 */
router.post("/volunteer/signup", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email already exists in the emailsToBeApproved collection
    const existingEmail = await EmailToBeApproved.findOne({ email });
    if (existingEmail) {
      return res.status(400).json("Email already exists");
    }

    // Save the email in the emailsToBeApproved collection
    const newEmail = new EmailToBeApproved({ email });
    await newEmail.save();
    res.json("Signup request sent");
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json("An error occurred while processing your request");
  }
});

/**
 * Generate a random 6-digit OTP (One-Time Password).
 */
function generateOTP() {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

/**
 * Endpoint to request OTP (One-Time Password) for email verification.
 * 
 * This route handles OTP requests, ensuring that an unexpired OTP does not
 * already exist, generating a new OTP, sending it to the provided email,
 * and saving the OTP with a 5-minute expiration.
 */
router.post("/otp/request-otp", async (req, res) => {
  const { email } = req.body;

  console.log(`TRANSPORT: ${transport}`);

  // Check if an unexpired OTP already exists
  const existingOTP = await OTP.findOne({ email, expiresAt: { $gt: new Date() } });
  if (existingOTP) {
    return res.status(429).json("An OTP is already active, please wait for it to expire.");
  }

  const otp = generateOTP(); // Generate a random 6-digit OTP

  try {
    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      html: `Here is your OTP: <b>${otp}</b>. It expires in 5 minutes.`,
    });

    // Save the OTP with an expiration of 5 minutes
    const newOTP = new OTP({ email, otp, expiresAt: new Date(Date.now() + 5 * 60000) });
    await newOTP.save();
    res.json("Email sent");
  } catch (err) {
    console.log(`Email failed to send: ${err}`);
    res.status(500).json("Failed to send email");
  }
});

/**
 * Endpoint to login using OTP (One-Time Password).
 * 
 * This route handles user logins using OTP. It checks the validity of the provided
 * OTP, generates a JWT token upon success, and sends it to the browser as a cookie.
 */
router.post("/volunteer/login", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json("Email and OTP required");
  }

  // Check if the provided OTP is valid and not expired
  const validOTP = await OTP.findOne({ email, otp, expiresAt: { $gt: new Date() } });
  if (!validOTP) {
    return res.status(400).json("Invalid OTP");
  }

  // Create a JWT token and send it to the browser as a cookie

  const token = jwt.sign({
    email: email,
    roles: ["volunteer"]
  }, TOKEN_SECRET as Secret, { expiresIn: "1h" }); // Set token expiry
  res.cookie("token", token, { httpOnly: true });
  res.json("OTP verified, user logged in");
});

/**
 * Endpoint to log out a user by clearing the JWT token cookie.
 */
router.post("/volunteer/logout", (req, res) => {
  res.clearCookie("token");
  res.json("User logged out");
});

/**
 * Endpoint to request admin login. 
 * 
 * Grants a JWT to the admin if the provided email and password is correct, 
 * and sends it to the browser as a cookie.
 */
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  
  // search for admin
  const admin = await Admin.findOne({ email: email });
  if(!admin) {
    return res.status(400).json("Invalid email or password");
  }

  // check provided password
  const same = await bcrypt.compare(password, admin.password);
  if(!same) {
    return res.status(400).json("Invalid email or password");
  }

  // sign and send admin token to client
  const token = jwt.sign({
    name: admin.name,
    email: admin.email,
    roles: ["admin"],
  }, TOKEN_SECRET as Secret, { expiresIn: "1h" });

  res.cookie("token", token, { httpOnly: true });
  res.status(200).json("Password verified, admin logged in");
});

/**
 * Endpoint to log out an admin by clearing the JWT token cookie.
 */
router.post("/admin/logout", (req, res) => {
  res.clearCookie("token");
  res.json("Admin logged out");
});

export default router;
