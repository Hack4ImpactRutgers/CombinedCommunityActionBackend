import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import roles from "../middleware/roles";
import siteLocation from "../schemas/site_schema";

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get("/all", [auth, roles.volunteer], async (req: Request, res: Response) => {
  console.log("/site/all");
  try{
    const sites = await siteLocation.find({});
    return res.status(200).json(sites);
  }
  catch(error){
    return res.status(400).json({error});
  }
});

router.delete("/:id", [auth, roles.volunteer], async (req: Request, res: Response)=>{
  const {id} = req.params;
  try {
    const deleted = await siteLocation.findByIdAndDelete(id);
    res.status(200).json({deleted});
  } catch(err) {
    console.error(err);
    res.status(400).json({error: JSON.stringify(err)});
  }
});

router.post("/", [auth, roles.volunteer], async (req: Request, res: Response) => {
  try {
    const {location} = req.body;
    const newSite = new siteLocation({location});
    await newSite.save();
    res.status(200).send(newSite);
  } catch(err) {
    console.error(err);
    res.status(400).json({error: JSON.stringify(err)});
  }
});

export default router;