/*
* This file handles all the requests that comes from the frontend
*/

const Doctor = require("../models/Doctor"); // The doctor model
const Patient = require("../models/Patient"); // The patient model
const Note = require("../models/Note"); // The note model
const nodemailer = require("nodemailer"); // A library that handles sending emails

/*
* This controller handles the request of fetching all the doctors
*/
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();

    if (!doctors) {
      throw Error("There are no doctors available.");
    }

    res.status(200).json({ doctors });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller handles the request of fetching all the doctors that a patient is subscribed to
 * it gets the list of ids of the doctors from the patients array of doctors
 * finds all the matches in the database and returns it
 */
const getYourDoctors = async (req, res) => {
  try {
    const patient = req.user;

    const doctorsIds = patient.doctors;

    const doctors = await Doctor.find({ _id: { $in: doctorsIds } });

    res.status(200).json({ doctors });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller handles the patients subscription for a doctor
 * it gets the doctor id from the params
 * checks if the doctor is already in the patients doctors
 * if not it pushes the id to the patients' doctors' array
 * send back an updated patient
 */
const addDoctorId = async (req, res) => {
  try {
    const patient = req.user;
    const { doctorId } = req.params;

    if (patient.doctors.includes(doctorId)) {
      return res.status(200).json({ updatedPatient: patient });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      {
        _id: patient._id,
      },
      { $push: { doctors: doctorId } },
      { new: true }
    );

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      { _id: doctorId },
      { $push: { patients: patient._id } }
    );

    res.status(200).json({ updatedPatient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller handles the unsubscribe in the same manner
 * 
 */
const removeDoctorId = async (req, res) => {
  try {
    const patient = req.user;
    const { doctorId } = req.params;

    const updatedPatient = await Patient.findByIdAndUpdate(
      {
        _id: patient._id,
      },
      { $pull: { doctors: doctorId } },
      { new: true }
    );

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      { _id: doctorId },
      { $pull: { patients: patient._id } }
    );

    res.status(200).json({ updatedPatient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller gets the patient by id
 */
const getPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById({ _id: patientId });

    res.status(200).json({ patient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller gets the patients that is subscribed to a doctor
 * 
 */
const getMyPatients = async (req, res) => {
  try {
    const doctor = req.user;

    const patientsIds = doctor.patients;

    const patients = await Patient.find({ _id: { $in: patientsIds } });

    res.status(200).json({ patients });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller gets the doctor by id
 */
const getDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById({ _id: doctorId });

    res.status(200).json({ doctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller handles adding a note to the patient
 * it recieves inputs from the request body
 * creates a new note in the note model
 * sends an email to the patient that a note is added
 * sends back the note to the frontend
 */
const addNote = async (req, res) => {
  try {
    const { title, description, patientId, doctorId } = req.body;

    const note = await Note.create({ title, description, patientId, doctorId });

    ////
    const config = {
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ORIGIN_EMAIL,
        pass: process.env.ORIGIN_PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(config);

    const data = {
      from: process.env.ORIGIN_EMAIL,
      to: "",
      subject: "Note is Added",
      text: "A new note is added",
    };

    transporter.sendMail(data, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });
    ////

    res.status(200).json({ note });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller fetches all the notes from the database based on the patients id
 * but if the user is a doctor, it only fetches those notes that were written by that doctor
 */
const getNotes = async (req, res) => {
  try {
    const { patientId } = req.params;

    const user = req.user;

    let notes;
    if (user.isDoctor) {
      notes = await Note.find({ patientId, doctorId: user._id });
    } else {
      notes = await Note.find({ patientId });
    }

    res.status(200).json({ notes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller handles the deleting of a note
 * it recieves the note's id
 * and sends an email to the user that a note is deleted
 */
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    await Note.findByIdAndDelete({ _id: noteId });

    ////
    const config = {
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ORIGIN_EMAIL,
        pass: process.env.ORIGIN_PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(config);

    const data = {
      from: process.env.ORIGIN_EMAIL,
      to: "",
      subject: "Note is Added",
      text: "A new note is added",
    };

    transporter.sendMail(data, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });
    ////

    res.status(200).json({ message: "Deleted." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * This controller handles the editing of the note
 * it recieves the new title and description from the request body
 * it revieves the note id from the params
 * update the note and sends an email to the user
 */
const editNote = async (req, res) => {
  try {
    const { title, description } = req.body;

    const { noteId } = req.params;

    const note = await Note.findByIdAndUpdate(
      { _id: noteId },
      { title, description },
      { new: true }
    );

    ////
     const config = {
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ORIGIN_EMAIL,
        pass: process.env.ORIGIN_PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(config);

    const data = {
      from: process.env.ORIGIN_EMAIL,
      to: "",
      subject: "Note is Added",
      text: "A new note is added",
    };

    transporter.sendMail(data, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });
    ////

    res.status(200).json({ note });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDoctors,
  getYourDoctors,
  addDoctorId,
  removeDoctorId,
  getPatient,
  getMyPatients,
  getDoctor,
  addNote,
  getNotes,
  deleteNote,
  editNote,
};
