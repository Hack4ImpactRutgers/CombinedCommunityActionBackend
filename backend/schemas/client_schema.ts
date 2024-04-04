import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  isActive: { type: Boolean, required: true },
  animal: { type: String, required: true },
  vet: { type: Boolean, required: true, default: false },
  food: {
    kind: String,
    lbs: Number
  },

  name: String,
  age: Number,
  description: String,
  weight: String,
  diet: String

}, { _id: false });

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  email: String,
  phone: String,

  address: String,

  street: String,
  city: String,
  state: String,
  zipCode: String,

  region: String,
  pets: [petSchema],
  needsUpdate: { type: Boolean, default: false },
});
const Client = mongoose.model("Client", clientSchema);

export { petSchema, Client };

export default Client;