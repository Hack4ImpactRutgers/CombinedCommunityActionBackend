import mongoose from 'mongoose';

const person = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  // Admin, Volunteer, Customer
  role: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('person', person);