import { Document, Schema, model } from "mongoose";

type QuestionTypeInput = {
  type: string;
  questionCount: number;
  marks: number;
};

export interface IAssignment extends Document {
  dueDate: string;
  questionTypes: QuestionTypeInput[];
  additionalInfo?: string;
  fileUrl?: string;
  status: "pending" | "processing" | "completed" | "failed";
  jobId?: string;
  result?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<QuestionTypeInput>(
  {
    type: { type: String, required: true, trim: true },
    questionCount: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    dueDate: { type: String, required: true, trim: true },
    questionTypes: {
      type: [QuestionTypeSchema],
      required: true,
      validate: {
        validator: (value: QuestionTypeInput[]) => Array.isArray(value) && value.length > 0,
        message: "questionTypes must contain at least one item",
      },
    },
    additionalInfo: { type: String, required: false, trim: true },
    fileUrl: { type: String, required: false, trim: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    jobId: { type: String, required: false },
    result: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true },
);

export default model<IAssignment>("Assignment", AssignmentSchema);
