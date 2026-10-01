const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    projectLink: {
      type: String,
      required: true,
      trim: true
    },

    workNotes: {
      type: String,
      required: true,
      trim: true
    },

    submittedAt: {
      type: Date,
      default: Date.now
    },

    marks: {
      type: Number,
      default: null,
      min: 0
    },

    feedback: {
      type: String,
      default: "",
      trim: true
    },

    status: {
      type: String,
      enum: ["Submitted", "Graded"],
      default: "Submitted"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
