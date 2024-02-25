import express, { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../schemas/otp_schema";
import EmailToBeApproved from "../schemas/emails_schema";
import Admin from "../schemas/admin_schema";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
import PasswordChangeRequest from "../schemas/password_change_schema";
import crypto from "crypto";

const saltRounds = 10;

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
    const newOTP = new OTP({ email, otp });
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
  const validOTP = await OTP.findOne({ email, otp });
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
 * Endpoint to register an admin.
 * 
 * Requires admin privileges.
 */
router.post("/admin/register", [auth, roles.admin], async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // validate request
  if(!name || !email || !password) {
    return res.status(400).json("Please enter all fields");
  }

  const admin = await Admin.findOne({ email: email });
  if(admin) {
    return res.status(400).json("Admin already exists");
  }

  const hash = bcrypt.hashSync(password, saltRounds);
  
  const newAdmin = new Admin({
    name: name,
    email: email,
    password: hash
  });

  newAdmin.save()
    .then(() => {
      // Respond with a success message and a 201 status code
      res.status(201).json("Admin successfully registered");
    })
    .catch((err: any) => {
      // Log the error and respond with a 400 status code
      console.error(err);
      res.status(400).send({ error: err.message });
    });
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


/**
 * Password Change Request Flow:
 * 1. User requests a password change by providing their email.
 *  a. Frontend sends a POST request to /auth/admin/forgot-password with the email in the request body.
 *  b. Regardless of whether or not the email exists, a status 200 is returned (to prevent email enumeration).
 * 2. We create the password change request in the database (if the email exists)
 *  a. We generate a password request token (CSPRNG string), hash it, and save it in the database with the user's email.
 *  b. Note that we don't send the resetToken to the user, but rather a jwt containing the resetToken and the user's email.
 *  b. This request expires after 24 hours.
 * 3. We send an email to the user with a link to the password change page.
 *  a. The link has a query parameter containing the password change request token.
 *  b. something like: /forgot-password?jwt=abc123
 * 4. To change the password, hit the /auth/admin/verify-forgot-password endpoint with the provided token and the new password.
 *  a. If the token is valid and not expired, we update the user's password and delete the password change request.
 *  b. If the token is invalid or expired, we respond with an error ("This password change request has expired or is invalid").
 * 
 * TODO:
 * - deal with multiple password change requests for the same user
 * - need to test more thoroughly
 */

/**
 * Endpoint to request a password reset.
 * body:
 * {
 *  email: string
 * }
 */
router.post("/admin/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json("Email required");
  }
  const user = await Admin.findOne({ email });
  if (!user) {
    return res.status(200).json("If a user with this email exists, an email will be sent to them.");
  }

  // generate the random token and hash it
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hash = bcrypt.hashSync(resetToken, saltRounds);

  // save the password change request in the database
  const passwordChangeRequest = new PasswordChangeRequest({
    email,
    token: hash
  });

  // send the email with the password change link containing the a jwt with the reset token and the user's email
  const token = jwt.sign({
    email: email,
    resetToken: resetToken
  }, TOKEN_SECRET as Secret, { expiresIn: "24h" });
  const emailLink = `${process.env.FRONTEND_URL}/auth/admin/forgot-password?jwt=${token}`;

  await transport.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "[CCA] Password Change Request",
    html: `Click <a href="${emailLink}">here</a> to change your password. This link expires in 24 hours.`
  });
  
  passwordChangeRequest.save().then(() => {
    res.status(200).json("If a user with this email exists, an email will be sent to them.");
  })
    .catch((err: any) => {
      console.error(err);
      res.status(500).json("An error occurred while processing your request");
    });
});

/**
 * Endpoint to verify a password change request.
 * The token should be the JWT provided in the email link
 * body:
 * {
 *  token: string,
 *  password: string,
 * }
 */
router.post("/admin/verify-forgot-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json("Token and password required");
  }

  // find the password change request
  const decoded = jwt.verify(token, TOKEN_SECRET as Secret) as { email: string, resetToken: string };
  const request = await PasswordChangeRequest.findOne({ email: decoded.email });
  if (!request) {
    return res.status(400).json("This password change request has expired or is invalid");
  }

  // check if the token is valid
  const valid = await bcrypt.compare(decoded.resetToken, request.token);
  if (!valid) {
    return res.status(400).json("This password change request has expired or is invalid");
  }

  // update the user's password
  const user = await Admin.findOne({ email: request.email });
  if(!user) {
    return res.status(400).json("User not found");
  }
  await request.deleteOne();

  user.password = bcrypt.hashSync(password, saltRounds);
  await user.save().then(() => {
    res.status(200).json("Password updated");
  })
    .catch((err: any) => {
      console.error(err);
      res.status(500).json("An error occurred while updating the password");
    });

});

export default router;
