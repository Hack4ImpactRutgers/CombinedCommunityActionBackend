import express, { Request, Response } from 'express';
const Client = require("../schemas/client_schema");
const router = express.Router();
/*
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/admin");
*/

router.get("/:id", (req: Request, res: Response) => {
    Client.findById(req.params.id).then(
        (client: any) => {
            res.send(client);
        }
    ).catch(
        (err: any) => {
            console.log(err);
            res.send("client " + req.params.id);
        }
    );
});

router.post("/", /*, [auth, adminAuth], */ (req: Request, res: Response) => {
    const newClient = new Client(req.body);
    newClient.save().then(
        (client: any) => {
            res.send(client);
        }
    ).catch(
        (err: any) => {
            res.send(err);
        }
    );
});

module.exports = router;