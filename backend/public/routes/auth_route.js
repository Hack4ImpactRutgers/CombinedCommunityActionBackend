"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_schema_1 = __importDefault(require("../schemas/otp_schema"));
const pending_volunteer_schema_1 = __importDefault(require("../schemas/pending_volunteer_schema"));
const admin_schema_1 = __importDefault(require("../schemas/admin_schema"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = __importDefault(require("../middleware/auth"));
const roles_1 = __importDefault(require("../middleware/roles"));
const password_change_schema_1 = __importDefault(require("../schemas/password_change_schema"));
const crypto_1 = __importDefault(require("crypto"));
const saltRounds = 10;
const router = express_1.default.Router();
// Load the secret key for JWT token from environment variables
const TOKEN_SECRET = process.env.TOKEN_SECRET;
// Setup Nodemailer to send emails using a Gmail account
const transport = nodemailer_1.default.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
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
router.post("/volunteer/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        // Check if the email already exists in the emailsToBeApproved collection
        const existingEmail = yield pending_volunteer_schema_1.default.findOne({ email });
        if (existingEmail) {
            console.log(existingEmail);
            return res.status(400).json("Email already exists");
        }
        // Save the email in the emailsToBeApproved collection
        const newEmail = new pending_volunteer_schema_1.default({ email });
        yield newEmail.save();
        res.json("Signup request sent");
    }
    catch (error) {
        // Handle any unexpected errors
        console.log(error);
        res.status(500).json("An error occurred while processing your request");
    }
}));
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
router.post("/otp/request-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    console.log(`TRANSPORT: ${transport}`);
    // Check if an unexpired OTP already exists
    const existingOTP = yield otp_schema_1.default.findOne({ email, expiresAt: { $gt: new Date() } });
    if (existingOTP) {
        return res.status(429).json("An OTP is already active, please wait for it to expire.");
    }
    const otp = generateOTP(); // Generate a random 6-digit OTP
    try {
        yield transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Email Verification",
            html: `Here is your OTP: <b>${otp}</b>. It expires in 5 minutes.`,
        });
        // Save the OTP with an expiration of 5 minutes
        const newOTP = new otp_schema_1.default({ email, otp });
        yield newOTP.save();
        res.json("Email sent");
    }
    catch (err) {
        console.log(`Email failed to send: ${err}`);
        res.status(500).json("Failed to send email");
    }
}));
/**
 * Endpoint to login using OTP (One-Time Password).
 *
 * This route handles user logins using OTP. It checks the validity of the provided
 * OTP, generates a JWT token upon success, and sends it to the browser as a cookie.
 */
router.post("/volunteer/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json("Email and OTP required");
    }
    // Check if the provided OTP is valid and not expired
    const validOTP = yield otp_schema_1.default.findOne({ email, otp });
    if (!validOTP) {
        return res.status(400).json("Invalid OTP");
    }
    // Create a JWT token and send it to the browser as a cookie
    const token = jsonwebtoken_1.default.sign({
        email: email,
        roles: ["volunteer"]
    }, TOKEN_SECRET, { expiresIn: "1h" }); // Set token expiry
    res.cookie("token", token, { httpOnly: true });
    res.json("OTP verified, user logged in");
}));
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
router.post("/admin/register", [auth_1.default, roles_1.default.admin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    // validate request
    if (!name || !email || !password) {
        return res.status(400).json("Please enter all fields");
    }
    const admin = yield admin_schema_1.default.findOne({ email: email });
    if (admin) {
        return res.status(400).json("Admin already exists");
    }
    const hash = bcryptjs_1.default.hashSync(password, saltRounds);
    const newAdmin = new admin_schema_1.default({
        name: name,
        email: email,
        password: hash
    });
    newAdmin.save()
        .then(() => {
        // send an email to the admin to notify them of their registration
        transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "[CCA] Admin Account Successfully Registered",
            html: `Hello ${name},<br><br>
        An admin account has been successfully registered for you with this email address. You may have already been supplied with a temporary password from the admin that registered you.
        However, it is highly recommended that you change your password as soon as possible. The link below will take you to the password change page.<br><br>
        <a href="${process.env.FRONTEND_URL}/auth/admin/forgot-password">Change Password</a>
        <br><br>
        Thank you
        <br>
        `
        });
        // Respond with a success message and a 201 status code
        res.status(201).json("Admin successfully registered");
    })
        .catch((err) => {
        // Log the error and respond with a 400 status code
        console.error(err);
        res.status(400).send({ error: err.message });
    });
}));
/**
 * Endpoint to request admin login.
 *
 * Grants a JWT to the admin if the provided email and password is correct,
 * and sends it to the browser as a cookie.
 */
router.post("/admin/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // search for admin
    const admin = yield admin_schema_1.default.findOne({ email: email });
    if (!admin) {
        return res.status(400).json("Invalid email or password");
    }
    // check provided password
    const same = yield bcryptjs_1.default.compare(password, admin.password);
    if (!same) {
        return res.status(400).json("Invalid email or password");
    }
    // sign and send admin token to client
    const token = jsonwebtoken_1.default.sign({
        name: admin.name,
        email: admin.email,
        roles: ["admin"],
    }, TOKEN_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { expires: new Date(Date.now() + 60 * 60 * 1000) });
    res.status(200).json("Password verified, admin logged in");
}));
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
router.post("/admin/forgot-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json("Email required");
    }
    const user = yield admin_schema_1.default.findOne({ email });
    if (!user) {
        return res.status(200).json("If a user with this email exists, an email will be sent to them.");
    }
    // generate the random token and hash it
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const hash = bcryptjs_1.default.hashSync(resetToken, saltRounds);
    // save the password change request in the database
    const existingRequest = yield password_change_schema_1.default.findOne({ email });
    if (existingRequest) {
        return res.status(200).json("If a user with this email exists, an email will be sent to them.");
    }
    const passwordChangeRequest = new password_change_schema_1.default({
        email,
        token: hash
    });
    // send the email with the password change link containing the a jwt with the reset token and the user's email
    const token = jsonwebtoken_1.default.sign({
        email: email,
        resetToken: resetToken
    }, TOKEN_SECRET, { expiresIn: "24h" });
    const emailLink = `${process.env.FRONTEND_URL}/auth/admin/forgot-password?jwt=${token}`;
    yield transport.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "[CCA] Password Change Request",
        html: `Click <a href="${emailLink}">here</a> to change your password. This link expires in 24 hours.
          If this link does not work, copy and paste the following into your browser: ${emailLink}`
    });
    passwordChangeRequest.save().then(() => {
        res.status(200).json("If a user with this email exists, an email will be sent to them.");
    }).catch((err) => {
        console.error(err);
        res.status(500).json("An error occurred while processing your request");
    });
}));
/**
 * Endpoint to verify a password change request.
 * The token should be the JWT provided in the email link
 * body:
 * {
 *  token: string,
 *  password: string,
 * }
 */
router.post("/admin/verify-forgot-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json("Token and password required");
    }
    // find the password change request
    const decoded = jsonwebtoken_1.default.verify(token, TOKEN_SECRET);
    const request = yield password_change_schema_1.default.findOne({ email: decoded.email });
    if (!request) {
        return res.status(400).json("This password change request has expired or is invalid");
    }
    // check if the token is valid
    const valid = yield bcryptjs_1.default.compare(decoded.resetToken, request.token);
    if (!valid) {
        return res.status(400).json("This password change request has expired or is invalid");
    }
    // update the user's password
    const user = yield admin_schema_1.default.findOne({ email: request.email });
    if (!user) {
        return res.status(400).json("User not found");
    }
    yield request.deleteOne();
    user.password = bcryptjs_1.default.hashSync(password, saltRounds);
    yield user.save().then(() => {
        res.status(200).json("Password updated");
    }).catch((err) => {
        console.error(err);
        res.status(500).json("An error occurred while updating the password");
    });
}));
exports.default = router;
