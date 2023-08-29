const express = require("express");
const {
  getDoctors,
  getYourDoctors,
  addDoctorId,
  removeDoctorId,
  getPatient,
  getDoctor,
  getMyPatients,
  addNote,
  getNotes,
  deleteNote,
  editNote,
} = require("../controllers/usersControllers");
const {
  requireAuthDoctor,
  requireAuthPatient,
  requireAuthUser,
} = require("../middleware/requireAuth");

const router = express.Router();

// Get all doctors
router.get("/doctors", requireAuthUser, getDoctors);

// Get your doctors
router.get("/yourdoctors", requireAuthPatient, getYourDoctors);

// Add a doctor's id in the patient's doctors array
router.patch("/subscribe/:doctorId", requireAuthPatient, addDoctorId);

// Unsubscribe
router.patch("/unsubscribe/:doctorId", requireAuthPatient, removeDoctorId);

// Get patient
router.get("/patient/:patientId", requireAuthUser, getPatient);

// Get my patients
router.get("/mypatients", requireAuthDoctor, getMyPatients);

// Get doctor
router.get("/doctor/:doctorId", requireAuthUser, getDoctor);

// Add new note
router.post("/note", requireAuthDoctor, addNote);

// Get notes
router.get("/notes/:patientId", requireAuthUser, getNotes);

// Delete note
router.delete("/note/delete/:noteId", requireAuthDoctor, deleteNote);

// Edit note
router.patch("/note/edit/:noteId", requireAuthDoctor, editNote);

module.exports = router;
