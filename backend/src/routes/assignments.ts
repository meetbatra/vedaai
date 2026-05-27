import express from "express";
import mongoose from "mongoose";
import puppeteer, { Browser } from "puppeteer";
import Assignment from "../models/Assignment";
import { assignmentQueue } from "../lib/queue";

const router = express.Router();

type QuestionTypePayload = {
  type: string;
  questionCount: number;
  marks: number;
};

type ResultQuestion = {
  number: number;
  text: string;
  difficulty?: "Easy" | "Moderate" | "Challenging";
  marks: number;
};

type ResultSection = {
  title: string;
  questionType: string;
  instruction: string;
  questions: ResultQuestion[];
};

type ResultAnswerKey = {
  number: number;
  answer: string;
};

type AssignmentResultPayload = {
  school?: string;
  subject?: string;
  grade?: string;
  className?: string;
  timeAllowed?: number | string;
  totalMarks?: number;
  instructions?: string;
  sections?: ResultSection[];
  answerKey?: ResultAnswerKey[];
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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toResultPayload = (value: unknown): AssignmentResultPayload => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as AssignmentResultPayload;
};

const difficultyBadgeStyle = (difficulty: string | undefined): string => {
  if (difficulty === "Moderate") {
    return "background:#fff8e6;color:#b38600;";
  }
  if (difficulty === "Challenging") {
    return "background:#fde9e9;color:#c92a2a;";
  }
  return "background:#e8f7ec;color:#2c8a4a;";
};

const buildQuestionPaperHtml = ({
  school,
  subject,
  className,
  timeAllowed,
  totalMarks,
  instructions,
  sections,
  answerKey,
}: {
  school: string;
  subject: string;
  className: string;
  timeAllowed: string;
  totalMarks: number;
  instructions: string;
  sections: ResultSection[];
  answerKey: ResultAnswerKey[];
}): string => {
  const sectionsHtml = sections
    .map((section) => {
      const questionsHtml = section.questions
        .map((question) => {
          const difficulty = question.difficulty ?? "Easy";
          return `
            <div class="question-row">
              <span class="question-number">${question.number}.</span>
              <div class="question-body">
                <span class="difficulty-badge" style="${difficultyBadgeStyle(difficulty)}">${escapeHtml(difficulty)}</span>
                ${escapeHtml(question.text)}
                <span class="question-marks">[${question.marks} ${question.marks === 1 ? "Mark" : "Marks"}]</span>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <section class="paper-section">
          <div class="section-title">${escapeHtml(section.title)}</div>
          <div class="section-type">${escapeHtml(section.questionType)}</div>
          <div class="section-instruction">${escapeHtml(section.instruction)}</div>
          ${questionsHtml}
        </section>
      `;
    })
    .join("");

  const answerKeyHtml =
    answerKey.length > 0
      ? `
        <section class="answer-key">
          <div class="answer-key-title">Answer Key:</div>
          ${answerKey
            .map(
              (entry) => `
                <div class="answer-key-item">
                  <span class="answer-number">${entry.number}.</span>
                  <span>${escapeHtml(entry.answer)}</span>
                </div>
              `,
            )
            .join("")}
        </section>
      `
      : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Question Paper</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body {
        margin: 0;
        font-family: "Bricolage Grotesque", "Segoe UI", Arial, sans-serif;
        color: #303030;
        background: #ffffff;
      }
      .page {
        max-width: 760px;
        margin: 0 auto;
        padding: 32px 40px;
      }
      .header { text-align: center; }
      .school { font-size: 28px; font-weight: 700; }
      .subhead { font-size: 20px; font-weight: 600; margin-top: 6px; }
      .divider { border-top: 1px solid rgba(0, 0, 0, 0.1); margin: 22px 0; }
      .meta { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
      .instructions { font-size: 15px; font-weight: 700; margin-bottom: 24px; }
      .student-info { font-size: 15px; line-height: 1.7; margin-bottom: 28px; }
      .paper-section { margin-bottom: 26px; }
      .paper-section {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }
      .section-title { text-align: center; font-size: 17px; font-weight: 700; margin: 18px 0; }
      .section-type { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
      .section-instruction { font-size: 13px; font-style: italic; color: #5e5e5e; margin-bottom: 14px; }
      .question-row { display: flex; gap: 8px; margin-bottom: 10px; font-size: 15px; line-height: 1.55; }
      .question-number { flex-shrink: 0; font-weight: 600; }
      .question-body { flex: 1; }
      .difficulty-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        margin-right: 8px;
      }
      .question-marks { font-size: 13px; color: #8c8c8c; margin-left: 6px; font-weight: 600; }
      .end-marker {
        text-align: center;
        font-size: 15px;
        font-weight: 700;
        margin: 28px 0;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 10px 0;
      }
      .answer-key {
        margin-top: 30px;
        padding-top: 16px;
        break-before: page;
        page-break-before: always;
      }
      .answer-key-title { font-size: 18px; font-weight: 700; margin-bottom: 14px; }
      .answer-key-item { display: flex; gap: 10px; font-size: 15px; line-height: 1.55; margin-bottom: 8px; }
      .answer-number { font-weight: 600; flex-shrink: 0; }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="header">
        <div class="school">${escapeHtml(school)}</div>
        <div class="subhead">Subject: ${escapeHtml(subject)}</div>
        <div class="subhead">Class: ${escapeHtml(className)}</div>
      </header>
      <div class="divider"></div>
      <div class="meta">
        <div>Time Allowed: ${escapeHtml(timeAllowed)} minutes</div>
        <div>Maximum Marks: ${totalMarks}</div>
      </div>
      <div class="instructions">${escapeHtml(instructions)}</div>
      <div class="student-info">
        <div>Name: ___________________</div>
        <div>Roll Number: _______________</div>
        <div>Class: ${escapeHtml(className)} Section: ________</div>
      </div>
      ${sectionsHtml}
      <div class="end-marker">End of Question Paper</div>
      ${answerKeyHtml}
    </div>
  </body>
</html>`;
};

router.post("/", async (req, res) => {
  try {
    const {
      subject,
      grade,
      className,
      timeAllowed,
      dueDate,
      questionTypes,
      additionalInfo,
      fileUrl,
    }: {
      subject?: unknown;
      grade?: unknown;
      className?: unknown;
      timeAllowed?: unknown;
      dueDate?: unknown;
      questionTypes?: unknown;
      additionalInfo?: unknown;
      fileUrl?: unknown;
    } = req.body;

    if (!subject || !grade || !className || !timeAllowed || !dueDate || !questionTypes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (
      typeof subject !== "string" ||
      typeof grade !== "string" ||
      typeof className !== "string" ||
      typeof timeAllowed !== "string" ||
      typeof dueDate !== "string"
    ) {
      return res.status(400).json({ error: "subject, grade, className, timeAllowed, and dueDate must be strings" });
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
      subject,
      grade,
      className,
      timeAllowed,
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
        subject,
        grade,
        className,
        timeAllowed,
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid assignment ID" });
    }

    const deleted = await Assignment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    return res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



router.get("/:id/pdf", async (req, res) => {
  let browser: Browser | null = null;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.status !== "completed" || !assignment.result) {
      return res.status(409).json({
        error: "Question paper is not ready yet. Try again after generation completes.",
      });
    }

    const result = toResultPayload(assignment.result);
    const totalMarks =
      typeof result.totalMarks === "number" && Number.isFinite(result.totalMarks)
        ? result.totalMarks
        : assignment.questionTypes.reduce(
            (sum, qt) => sum + qt.questionCount * qt.marks,
            0,
          );

    const html = buildQuestionPaperHtml({
      school: result.school || "Delhi Public School, Sector-4, Bokaro",
      subject: result.subject || assignment.subject,
      className: result.className || assignment.className,
      timeAllowed:
        typeof result.timeAllowed === "number" || typeof result.timeAllowed === "string"
          ? String(result.timeAllowed)
          : assignment.timeAllowed,
      totalMarks,
      instructions:
        result.instructions ||
        "All questions are compulsory unless stated otherwise.",
      sections: Array.isArray(result.sections) ? result.sections : [],
      answerKey: Array.isArray(result.answerKey) ? result.answerKey : [],
    });

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "16mm",
        right: "12mm",
        bottom: "16mm",
        left: "12mm",
      },
      preferCSSPageSize: true,
    });

    const safeSubject = (result.subject || assignment.subject || "assignment")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"${safeSubject || "assignment"}-question-paper.pdf\"`,
    );

    return res.status(200).send(Buffer.from(pdf));
  } catch (error) {
    console.error("Error generating assignment PDF:", error);
    return res.status(500).json({ error: "Failed to generate PDF" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

export default router;
