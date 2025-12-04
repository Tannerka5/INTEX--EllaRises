require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");


const authRoutes = require("./routes/authRoutes");
const participantRoutes = require("./routes/participantRoutes");
const eventRoutes = require("./routes/eventRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const donationRoutes = require("./routes/donationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const impactRoutes = require("./routes/impactRoutes");
const usersRoutes = require("./routes/usersRoutes");

const userRoutes = require("./routes/userRoutes");


const { attachUserToLocals } = require("./middleware/authMiddleware");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = path.join(__dirname, "views");  // MUST be here

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = path.join(__dirname, "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(flash());
app.use(attachUserToLocals);

// PUBLIC LANDING PAGE MUST COME *BEFORE* ANY ROUTES
app.get("/", (req, res) => {
  res.render("index", { title: "Ella Rises" });
});

// NOW ADD OTHER ROUTES
app.use("/", authRoutes);
app.use("/participants", participantRoutes);
app.use("/events", eventRoutes);
app.use("/milestones", milestoneRoutes);
app.use("/surveys", surveyRoutes);
app.use("/donations", donationRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/impact", impactRoutes);
app.use("/users", usersRoutes);
app.use("/users", userRoutes);


// 418 Easter egg – I'm a teapot
app.get("/418", (req, res) => {
  res.status(418); // HTTP 418
  res.render("418", {
    title: "418 – I'm a Teapot",
    currentUser: req.session ? req.session.user : null
  });
});

// 404
app.use((req, res) => {
  res.status(404).render("404");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ella Rises app running on http://localhost:${PORT}`);
});


app.use((req, res) => {
  res.status(404).render("404");
});
