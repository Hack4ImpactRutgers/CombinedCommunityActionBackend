import express, { Request, Response } from 'express';
const Admin = require('../schemas/admin_schema');
const router = express.Router();
/*
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/admin");
*/

router.get('/:id', (req: Request, res: Response) => {
  Admin.findById(req.params.id).then(
    (admin: any) => {
      res.send(admin);
    }
  ).catch(
    (err: any) => {
      console.log(err);
      res.send('admin ' + req.params.id);
    }
  );
});

router.post('/', /*, [auth, adminAuth], */ (req: Request, res: Response) => {
  const newAdmin = new Admin(req.body);
  newAdmin.save().then(
    (admin: any) => {
      res.send(admin);
    }
  ).catch(
    (err: any) => {
      res.send(err);
    }
  );
});

module.exports = router;