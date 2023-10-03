import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  isActive: {type: Boolean, required: true},
  animal: { type: String, required: true },
  vet: { type: Boolean, required: true, default: false },
  food: {
    kind: String,
    lbs: Number
  },
}, { _id: false });

const clientSchema = new mongoose.Schema({
  name: {type: String, required: true},
  age: Number,
  address: String,
  region: String,
  pets: [petSchema]
});

module.exports = mongoose.model('Client', clientSchema);