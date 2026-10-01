const express = require("express");

const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

const {
  auth,
  facultyOnly,
  studentOnly
} = require("../middleware/auth");

const router = express.Router();

// Student: Submit assignment
router.post("/", auth, studentOnly, async (req, res) => {
  try {
    const {
      assignmentId,
      projectLink,
      workNotes
    } = req.body;

    if (!assignmentId || !projectLink || !workNotes) {
      return res.status(400).json({
        message: "Assignment, project link and work notes are required"
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found"
      });
    }

    // Check deadline
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({
        message: "Submission deadline has passed"
      });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({
        message: "You have already submitted this assignment"
      });
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user.id,
      projectLink,
      workNotes
    });

    res.status(201).json({
      message: "Assignment submitted successfully",
      submission
    });
  } catch (error) {
    console.error("Submission error:", error);

    res.status(500).json({
      message: "Server error while submitting assignment"
    });
  }
});

// Student: View own submissions
router.get("/student", auth, studentOnly, async (req, res) => {
  try {
    const submissions = await Submission.find({
      student: req.user.id
    })
      .populate(
        "assignment",
        "title subject dueDate maxMarks"
      )
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error("Student submissions error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// Faculty: View submissions for their assignments
router.get("/faculty", auth, facultyOnly, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      createdBy: req.user.id
    }).select("_id");

    const assignmentIds = assignments.map(
      (assignment) => assignment._id
    );

    const submissions = await Submission.find({
      assignment: { $in: assignmentIds }
    })
      .populate(
        "assignment",
        "title subject maxMarks dueDate"
      )
      .populate(
        "student",
        "name email"
      )
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error("Faculty submissions error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// Faculty: Grade submission
router.put("/:id/grade", auth, facultyOnly, async (req, res) => {
  try {
    const {
      marks,
      feedback
    } = req.body;

    if (marks === undefined || marks === null) {
      return res.status(400).json({
        message: "Marks are required"
      });
    }

    const submission = await Submission.findById(req.params.id)
      .populate("assignment");

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found"
      });
    }

    // Make sure this assignment belongs to the faculty
    if (
      submission.assignment.createdBy.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "You cannot grade this submission"
      });
    }

    // Validate marks
    if (
      Number(marks) < 0 ||
      Number(marks) > submission.assignment.maxMarks
    ) {
      return res.status(400).json({
        message: `Marks must be between 0 and ${submission.assignment.maxMarks}`
      });
    }

    submission.marks = Number(marks);
    submission.feedback = feedback || "";
    submission.status = "Graded";

    await submission.save();

    res.json({
      message: "Submission graded successfully",
      submission
    });
  } catch (error) {
    console.error("Grading error:", error);

    res.status(500).json({
      message: "Server error while grading submission"
    });
  }
});

module.exports = router;
