import express, { Request, Response } from "express";
import Admin from "../schemas/admin_schema";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
import bcrypt from "bcryptjs";

const saltRounds = 10;
const router = express.Router();

// Route to fetch an admin by its ID
router.get("/:id", (req: Request, res: Response) => {
  Admin.findById(req.params.id)
    .then((admin: any) => {
      if (!admin) {
        // If admin is not found, respond with a 404 status code
        return res.status(404).send({ error: "Admin not found." });
      }
      // Respond with the admin data
      res.send(admin);
    })
    .catch((err: any) => {
      // Log the error and respond with a 500 status code
      console.error(err);
      res.status(500).send({ error: "An error occurred fetching the admin." });
    });
});

/**
 * Endpoint to register an admin.
 * 
 * Requires admin privileges.
 */
router.post("/register", [auth, roles.admin], async (req: Request, res: Response) => {
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
      // Respond with the created admin data and a 201 status code
      res.status(201).json("Admin successfully registered");
    })
    .catch((err: any) => {
      // Log the error and respond with a 400 status code
      console.error(err);
      res.status(400).send({ error: err.message });
    });
});

export default router;
