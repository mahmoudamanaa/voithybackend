/*
* This file is where we write all the authentication controllers functions
*/

const jwt = require("jsonwebtoken"); // A library to generate the token
const bcrypt = require("bcrypt"); // A library that helps us with the hashing of the password
const validator = require("validator"); // A library that helps us with validating user inputs

const Doctor = require("../models/Doctor"); // The doctor model
const Patient = require("../models/Patient"); // The patient model

/*
* This controller is responible for handling the signup for a doctor.
* it recieves the doctors credentials as well as the specialization from the body of the request
* it validates the input
* checks if the email exists
* hash the password
* creating the doctor in the database
* generates the token and sending a response with the required data to the frontend
*/
const doctorSignup = async (req, res) => {
  try {
    const { username, email, password, specialization } = req.body;

    if (!username || !email || !password || !specialization) {
      throw Error("All fields must be filled.");
    }

    if (!validator.isEmail(email)) {
      throw Error("Email is not valid.");
    }

    if (!validator.isStrongPassword(password)) {
      throw Error("Password not strong enough.");
    }

    const exists = await Doctor.findOne({ email });

    if (exists) {
      throw Error("Email already in use.");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doctor = await Doctor.create({
      username,
      email,
      password: hash,
      specialization,
    });

    const token = jwt.sign(
      {
        userId: doctor._id,
        isDoctor: doctor.isDoctor,
        isPatient: doctor.isPatient,
      },
      process.env.SECRET,
      { expiresIn: "3d" }
    );

    res.status(200).json({
      token,
      username: doctor.username,
      email: doctor.email,
      userId: doctor._id,
      isDoctor: doctor.isDoctor,
      isPatient: doctor.isPatient,
      specialization: doctor.specialization,
      patients: doctor.patients,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/*
* This controller is responible for handling the signup for a patient.
* it recieves the patients credentials from the body of the request
* it validates the input
* checks if the email exists
* hash the password
* creating the doctor in the database
* generates the token and sending a response with the required data to the frontend
*/
const patientSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw Error("All fields must be filled.");
    }

    if (!validator.isEmail(email)) {
      throw Error("Email is not valid.");
    }

    if (!validator.isStrongPassword(password)) {
      throw Error("Password not strong enough.");
    }

    const exists = await Patient.findOne({ email });

    if (exists) {
      throw Error("Email already in use.");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const patient = await Patient.create({
      username,
      email,
      password: hash,
    });

    const token = jwt.sign(
      {
        userId: patient._id,
        isDoctor: patient.isDoctor,
        isPatient: patient.isPatient,
      },
      process.env.SECRET,
      { expiresIn: "3d" }
    );

    res.status(200).json({
      token,
      username: patient.username,
      email: patient.email,
      userId: patient._id,
      isDoctor: patient.isDoctor,
      isPatient: patient.isPatient,
      doctors: patient.doctors,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/*
* This controller is responible for handling the login for either a doctor or a patient.
* it recieves the user's credentials from the body of the request
* it validates the input
* checks if that user is a doctor, if not it is a patient
* it checks that the password is correct
* generates the token and sending a response with the required data to the frontend
* if it was a doctor, it makes the same procedures but for a doctor
*/
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw Error("All fields must be filled.");
    }

    const doctor = await Doctor.findOne({ email });
    let patient;
    if (!doctor) {
      patient = await Patient.findOne({ email });
      if (!patient) {
        throw Error("Incorrect email.");
      }
      // patient
      const match = await bcrypt.compare(password, patient.password);

      if (!match) {
        throw Error("Incorrect password.");
      }

      const token = jwt.sign(
        {
          userId: patient._id,
          isDoctor: patient.isDoctor,
          isPatient: patient.isPatient,
        },
        process.env.SECRET,
        { expiresIn: "3d" }
      );

      return res.status(200).json({
        token,
        username: patient.username,
        email: patient.email,
        userId: patient._id,
        isDoctor: patient.isDoctor,
        isPatient: patient.isPatient,
        doctors: patient.doctors,
      });
    }
    // doctor
    const match = await bcrypt.compare(password, doctor.password);

    if (!match) {
      throw Error("Incorrect password.");
    }

    const token = jwt.sign(
      {
        userId: doctor._id,
        isDoctor: doctor.isDoctor,
        isPatient: doctor.isPatient,
      },
      process.env.SECRET,
      { expiresIn: "3d" }
    );

    return res.status(200).json({
      token,
      username: doctor.username,
      email: doctor.email,
      userId: doctor._id,
      isDoctor: doctor.isDoctor,
      isPatient: doctor.isPatient,
      specialization: doctor.specialization,
      patients: doctor.patients,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { doctorSignup, patientSignup, login };
