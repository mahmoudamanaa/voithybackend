const Doctor = require("./models/Doctor");
const Patient = require("./models/Patient");
const jwt = require("jsonwebtoken");

const express = require("express"); // express framework
const dotenv = require("dotenv"); // library that handles the environment variables
const mongoose = require("mongoose"); // mongoose library that connects to the database
const cors = require("cors"); // library that handles the cors errors

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const authRoutes = require("./routes/auth"); // auth routes
const usersRoutes = require("./routes/users"); // users routes

dotenv.config(); // initializing the env variables libraries

const app = express(); // run the express framework

app.use(express.json()); // a middleware that handles the json body in the request
app.use(cors()); // initializing the cors library

app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/api/auth", authRoutes); // handling routes middlewares
app.use("/api/users", usersRoutes);

let myQuery;
let myProfile;
let data;

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, callback) {
      myProfile = profile;
      callback(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user object
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/auth/google", (req, res, next) => {
  // Redirect the user to Google with the additional parameters
  myQuery = req.query;

  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login/failed",
  }),
  async (req, res) => {
    const username = myProfile.displayName;
    const email = myProfile.emails[0].value;
    const type = myQuery.type;
    const specialization = myQuery.spec ? myQuery.spec : undefined;

    let doctor;
    let token;
    let user;

    if (type === "login") {
      user = await Doctor.findOne({ email });
      if (user) {
        token = jwt.sign(
          {
            userId: user._id,
            isDoctor: user.isDoctor,
            isPatient: user.isPatient,
          },
          process.env.SECRET,
          { expiresIn: "3d" }
        );

        data = {
          token,
          username: user.username,
          email: user.email,
          userId: user._id,
          isDoctor: user.isDoctor,
          isPatient: user.isPatient,
          specialization: user.specialization,
          patients: user.patients,
        };
      } else {
        user = await Patient.findOne({ email });

        token = jwt.sign(
          {
            userId: user._id,
            isDoctor: user.isDoctor,
            isPatient: user.isPatient,
          },
          process.env.SECRET,
          { expiresIn: "3d" }
        );

        data = {
          token,
          username: user.username,
          email: user.email,
          userId: user._id,
          isDoctor: user.isDoctor,
          isPatient: user.isPatient,
          specialization: user.specialization,
          patients: user.patients,
        };
      }
    }

    if (type === "doctor") {
      doctor = await Doctor.findOne({ email });

      if (doctor) {
        token = jwt.sign(
          {
            userId: doctor._id,
            isDoctor: doctor.isDoctor,
            isPatient: doctor.isPatient,
          },
          process.env.SECRET,
          { expiresIn: "3d" }
        );

        data = {
          token,
          username: doctor.username,
          email: doctor.email,
          userId: doctor._id,
          isDoctor: doctor.isDoctor,
          isPatient: doctor.isPatient,
          specialization: doctor.specialization,
          patients: doctor.patients,
        };
      } else {
        doctor = await Doctor.create({
          username,
          email,
          password: "123@Ma123",
          specialization,
        });

        token = jwt.sign(
          {
            userId: doctor._id,
            isDoctor: doctor.isDoctor,
            isPatient: doctor.isPatient,
          },
          process.env.SECRET,
          { expiresIn: "3d" }
        );

        data = {
          token,
          username: doctor.username,
          email: doctor.email,
          userId: doctor._id,
          isDoctor: doctor.isDoctor,
          isPatient: doctor.isPatient,
          specialization: doctor.specialization,
          patients: doctor.patients,
        };
      }
    }

    let patient;
    if (type === "patient") {
      patient = await Patient.findOne({ email });

      if (patient) {
        token = jwt.sign(
          {
            userId: patient._id,
            isDoctor: patient.isDoctor,
            isPatient: patient.isPatient,
          },
          process.env.SECRET,
          { expiresIn: "3d" }
        );

        data = {
          token,
          username: patient.username,
          email: patient.email,
          userId: patient._id,
          isDoctor: patient.isDoctor,
          isPatient: patient.isPatient,
          patients: patient.doctors,
        };
      } else {
        patient = await Patient.create({
          username,
          email,
          password: "",
        });

        token = jwt.sign(
          {
            userId: patient._id,
            isDoctor: patient.isDoctor,
            isPatient: patient.isPatient,
          },
          process.env.SECRET,
          { expiresIn: "3d" }
        );

        data = {
          token,
          username: patient.username,
          email: patient.email,
          userId: patient._id,
          isDoctor: patient.isDoctor,
          isPatient: patient.isPatient,
          patients: patient.doctors,
        };
      }
    }

    res.redirect("http://localhost:3000");
  }
);

app.get("/auth/login/success", async (req, res) => {
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(200).json({ error: true });
  }
});

app.get("/auth/login/failed", (req, res) => {
  console.log("Failed");
});

app.get("/auth/logout", (req, res) => {
  data = null;
  req.logout();
  res.redirect("http://localhost:3000");
});

/**
 * Handling the mongoose database connection and running the app
 */
mongoose
  .connect(process.env.MONGOURL)
  .then((result) => {
    console.log("Database Connected.");
    app.listen(4000);
    console.log("Server Running.");
  })
  .catch((err) => {
    console.log(err);
  });
