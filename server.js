const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    department: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1, max: 5 }
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

// READ: get all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch students." });
  }
});

// CREATE: add a student
app.post("/api/students", async (req, res) => {
  try {
    const { name, email, department, year } = req.body;
    if (!name?.trim() || !email?.trim() || !department?.trim() || year === undefined) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    const student = await Student.create({ name, email, department, year: Number(year) });
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This email is already registered." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Please enter valid student details." });
    }
    res.status(500).json({ message: "Could not add student." });
  }
});

// UPDATE: edit a student
app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, email, department, year } = req.body;
    if (!name?.trim() || !email?.trim() || !department?.trim() || year === undefined) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, department, year: Number(year) },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This email is already registered." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Please enter valid student details." });
    }
    res.status(500).json({ message: "Could not update student." });
  }
});

// DELETE: remove a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Invalid student ID." });
  }
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_management");
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("MongoDB connection failed.");
    console.error("Check that MongoDB is running and your MONGODB_URI is correct.");
    console.error(error.message);
    process.exit(1);
  }
}
startServer();