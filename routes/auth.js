const express = require("express");
const {
  doctorSignup,
  patientSignup,
  login,
} = require("../controllers/authControllers");

const router = express.Router();

// Signup for doctor route
router.post("/doctor/signup", doctorSignup);

// Signup for patient route
router.post("/patient/signup", patientSignup);

// Login route
router.post("/login", login);

module.exports = router;
