/**
 * Here we create the doctor's model
 * 
 */

const mongoose = require("mongoose");

const { Schema } = mongoose;

const doctorSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, requied: true },
  isDoctor: { type: Boolean, default: true },
  isPatient: { type: Boolean, default: false },
  patients: { type: [String] },
});

module.exports = mongoose.model("Doctor", doctorSchema);
