/**
 * Here we create the patients's model
 *
 */

const mongoose = require("mongoose");

const { Schema } = mongoose;

const patientSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isDoctor: { type: Boolean, default: false },
  isPatient: { type: Boolean, default: true },
  doctors: { type: [String] },
});

module.exports = mongoose.model("Patient", patientSchema);
