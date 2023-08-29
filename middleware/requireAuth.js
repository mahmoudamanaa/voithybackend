/**
 * In this middleware we handle the users authentication in two levels
 * level 1: if he is a users
 * level 2: whether he is a doctor or a patients
 */

const jwt = require("jsonwebtoken"); // library for token generation but we use it here for verifying
const Doctor = require("../models/Doctor"); // Doctor model
const Patient = require("../models/Patient"); // Patient model

/**
 * This middlware handles the normal authentication
 * it checks if there is an authorization header in the request
 * it extracts the token
 * verifies the token and return the payload
 * depending on the isDoctor/isPatient flags, we finds the user in the database and send it with
 * the request to other middlewares
 */
const requireAuthUser = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Not Authorized." });
  }

  const token = authorization.split(" ")[1];

  try {
    const { userId, isDoctor, isPatient } = jwt.verify(
      token,
      process.env.SECRET
    );

    if (isDoctor) {
      req.user = await Doctor.findOne({ _id: userId });
    }

    if (isPatient) {
      req.user = await Patient.findOne({ _id: userId });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Not Authorized." });
  }
};

/**
 * This middlware handles the doctor authentication
 * it checks if there is an authorization header in the request
 * it extracts the token
 * verifies the token and return the payload
 * if the isDoctor flag is true it finds the doctor in the database and sends it with the request
 * if it was a patient it throws an authorization error
 */
const requireAuthDoctor = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Not Authorized." });
  }

  const token = authorization.split(" ")[1];

  try {
    const { userId, isDoctor, isPatient } = jwt.verify(
      token,
      process.env.SECRET
    );

    if (isDoctor) {
      req.user = await Doctor.findOne({ _id: userId });
    }

    if (isPatient) {
      return res.status(401).json({ error: "Not Authorized." });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Not Authorized." });
  }
};

/**
 * This middlware handles the patient authentication
 * it checks if there is an authorization header in the request
 * it extracts the token
 * verifies the token and return the payload
 * if the isPatient flag is true it finds the patient in the database and sends it with the request
 * if it was a doctor it throws an authorization error
 */
const requireAuthPatient = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Not Authorized." });
  }

  const token = authorization.split(" ")[1];

  try {
    const { userId, isDoctor, isPatient } = jwt.verify(
      token,
      process.env.SECRET
    );

    if (isDoctor) {
      return res.status(401).json({ error: "Not Authorized." });
    }

    if (isPatient) {
      req.user = await Patient.findOne({ _id: userId });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Not Authorized." });
  }
};

module.exports = { requireAuthUser, requireAuthDoctor, requireAuthPatient };
