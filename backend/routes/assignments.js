const express = require("express");

const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const {
  auth,
  facultyOnly,
  studentOnly
} = require("../middleware/auth");

const router = express.Router();

// Faculty: Create assignment
router.post("/", auth, facultyOnly, async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      dueDate,
      maxMarks
    } = req.body;

    if (
      !title ||
      !subject ||
      !description ||
      !dueDate ||
      !maxMarks
    ) {
      return res.status(400).json({
        message: "All assignment fields are required"
      });
    }

    const assignment = await Assignment.create({
      title,
      subject,
      description,
      dueDate,
      maxMarks,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Assignment created successfully",
      assignment
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    res.status(500).json({
      message: "Server error while creating assignment"
    });
  }
});

// Faculty: View own assignments
router.get("/faculty", auth, facultyOnly, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      createdBy: req.user.id
    }).sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    console.error("Faculty assignments error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// Student: View all assignments
router.get("/student", auth, studentOnly, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 });

    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignment: assignment._id,
          student: req.user.id
        });

        return {
          ...assignment.toObject(),
          submission: submission || null,
          status: submission
            ? submission.status
            : "Pending"
        };
      })
    );

    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error("Student assignments error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;
