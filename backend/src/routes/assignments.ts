import express from "express";
import mongoose from "mongoose";
import Assignment from "../models/Assignment";
import { assignmentQueue } from "../lib/queue";

const router = express.Router();

type QuestionTypePayload = {
  type: string;
  questionCount: number;
  marks: number;
};

const isValidQuestionType = (
  questionType: unknown,
): questionType is QuestionTypePayload => {
  if (!questionType || typeof questionType !== "object") {
    return false;
  }

  const candidate = questionType as Record<string, unknown>;
  return (
    typeof candidate.type === "string" &&
    typeof candidate.questionCount === "number" &&
    Number.isFinite(candidate.questionCount) &&
    candidate.questionCount > 0 &&
    typeof candidate.marks === "number" &&
    Number.isFinite(candidate.marks) &&
    candidate.marks > 0
  );
};

router.post("/", async (req, res) => {
  try {
    const {
      dueDate,
      questionTypes,
      additionalInfo,
      fileUrl,
    }: {
      dueDate?: unknown;
      questionTypes?: unknown;
      additionalInfo?: unknown;
      fileUrl?: unknown;
    } = req.body;

    if (!dueDate || !questionTypes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (typeof dueDate !== "string") {
      return res.status(400).json({ error: "dueDate must be a string" });
    }

    if (
      !Array.isArray(questionTypes) ||
      questionTypes.length === 0 ||
      !questionTypes.every(isValidQuestionType)
    ) {
      return res.status(400).json({
        error: "questionTypes must be a non-empty array of valid question type objects",
      });
    }

    const assignment = new Assignment({
      dueDate,
      questionTypes,
      additionalInfo: typeof additionalInfo === "string" ? additionalInfo : undefined,
      fileUrl: typeof fileUrl === "string" ? fileUrl : undefined,
      status: "pending",
    });

    await assignment.save();

    const job = await assignmentQueue.add(
      "generate",
      {
        assignmentId: assignment._id.toString(),
        dueDate,
        questionTypes,
        additionalInfo: typeof additionalInfo === "string" ? additionalInfo : undefined,
        fileUrl: typeof fileUrl === "string" ? fileUrl : undefined,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );

    const jobId = job.id === undefined || job.id === null ? undefined : String(job.id);
    assignment.jobId = jobId;
    await assignment.save();

    return res.status(201).json({
      success: true,
      assignmentId: assignment._id,
      jobId,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    return res.status(200).json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    return res.status(200).json({ assignment });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
