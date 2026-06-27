const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Routes
const latestJobRoutes = require("./routes/latestjobroute");
const resultRoutes = require("./routes/resultRoutes");
const admitCardRoutes = require("./routes/admitCardRoutes");
const answerKeyRoutes = require("./routes/answerKeyRoutes");
const syllabusRoutes = require("./routes/syllabusRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const importantRoutes = require("./routes/importantRoutes");

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sarkarijobhub.website",
      "https://www.sarkarijobhub.website",
    ],
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/jobs", latestJobRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admit-cards", admitCardRoutes);
app.use("/api/answer-keys", answerKeyRoutes);
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/important", importantRoutes);


// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DevTender API Running Successfully 🚀",
  });
});

// Database Connection
connectDB()
  .then(() => {
    console.log("✅ Database Connected Successfully");

    app.listen(port, () => {
      console.log(`🚀 Server Running on PORT ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed", err);
    process.exit(1);
  });