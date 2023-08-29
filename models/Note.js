/**
 * Here we create the note's model
 * 
 */

const mongoose = require("mongoose");

const { Schema } = mongoose;

const NoteSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  patientId: { type: String },
  doctorId: { type: String },
});

module.exports = mongoose.model("Note", NoteSchema);
