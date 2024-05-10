import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    location: { type: String },
  });

const siteLocation = mongoose.model("SiteLocation", siteSchema);

export default siteLocation;