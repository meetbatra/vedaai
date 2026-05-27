import { Job, Worker } from "bullmq";
import mongoose from "mongoose";
import OpenAI from "openai";
import { MONGODB_URI, OPENAI_API_KEY } from "../config/env";
import { bullRedisConnection } from "../lib/queue";
import { buildQuestionPaperPrompt } from "../lib/promptBuilder";
import Assignment from "../models/Assignment";

void mongoose;
void MONGODB_URI;

type QuestionTypePayload = {
  type: string;
  questionCount: number;
  marks: number;
};

type AssignmentJobData = {
  assignmentId: string;
  subject: string;
  grade: string;
  className: string;
  timeAllowed: string;
  questionTypes: QuestionTypePayload[];
  additionalInfo?: string;
  extractedFileText?: string;
};

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const worker = new Worker(
  "assignments",
  async (job: Job<AssignmentJobData>) => {
    const {
      assignmentId,
      subject,
      grade,
      className,
      timeAllowed,
      questionTypes,
      additionalInfo,
      extractedFileText,
    } = job.data;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    assignment.status = "processing";
    await assignment.save();

    const prompt = buildQuestionPaperPrompt({
      subject,
      grade,
      className,
      timeAllowed,
      questionTypes,
      additionalInfo,
      extractedFileText,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert teacher and exam paper creator. You always respond with valid JSON only, no markdown formatting, no code blocks, no extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Empty response from OpenAI");
    }

    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(rawContent);
    } catch {
      throw new Error(
        `Failed to parse OpenAI response as JSON: ${rawContent.slice(0, 200)}`,
      );
    }

    assignment.result = parsedResult;
    assignment.status = "completed";
    await assignment.save();

    console.log(`Assignment ${assignmentId} completed successfully`);
    return { assignmentId, status: "completed" };
  },
  {
    connection: bullRedisConnection,
    concurrency: 3,
  },
);

worker.on("completed", (job: Job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", async (job: Job | undefined, err: Error) => {
  console.error(`Job ${job?.id} failed:`, err.message);
  if (job?.data && typeof job.data === "object" && "assignmentId" in job.data) {
    const assignmentId = (job.data as { assignmentId?: unknown }).assignmentId;
    if (typeof assignmentId === "string") {
      try {
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: "failed",
        });
      } catch {
        console.error("Failed to update assignment status to failed");
      }
    }
  }
});

export default worker;
