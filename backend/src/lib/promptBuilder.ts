type QuestionTypeInput = {
  type: string;
  questionCount: number;
  marks: number;
};

type PromptBuilderInput = {
  subject: string;
  grade: string;
  className: string;
  timeAllowed: string;
  questionTypes: QuestionTypeInput[];
  additionalInfo?: string;
};

export function buildQuestionPaperPrompt(data: PromptBuilderInput): string {
  const sectionList = data.questionTypes
    .map(
      (qt, i) =>
        `Section ${String.fromCharCode(65 + i)}: ${qt.questionCount} ${qt.type} — ${qt.marks} mark(s) each`,
    )
    .join("\n");

  const totalMarks = data.questionTypes.reduce(
    (sum, qt) => sum + qt.questionCount * qt.marks,
    0,
  );

  return `You are an expert teacher creating a question paper.

Generate a complete question paper with the following details:
- Subject: ${data.subject}
- Grade/Class: Grade ${data.grade}
- Section: ${data.className}
- Time Allowed: ${data.timeAllowed} minutes
- Total Marks: ${totalMarks}
- School: Delhi Public School, Sector-4, Bokaro

Sections required:
${sectionList}

${data.additionalInfo ? `Additional Instructions: ${data.additionalInfo}` : ""}

You MUST respond with a single valid JSON object only. No markdown, no explanation, no text outside the JSON.

The JSON must follow this exact structure:
{
  "school": "Delhi Public School, Sector-4, Bokaro",
  "subject": "${data.subject}",
  "grade": "${data.grade}",
  "className": "${data.className}",
  "timeAllowed": ${data.timeAllowed},
  "totalMarks": ${totalMarks},
  "instructions": "All questions are compulsory unless stated otherwise.",
  "sections": [
    {
      "title": "Section A",
      "questionType": "Short Answer Questions",
      "instruction": "Attempt all questions. Each question carries 2 marks",
      "questions": [
        {
          "number": 1,
          "text": "Question text here",
          "difficulty": "Easy",
          "marks": 2
        }
      ]
    }
  ],
  "answerKey": [
    {
      "number": 1,
      "answer": "Answer text here"
    }
  ]
}

Rules:
- difficulty must be exactly one of: "Easy", "Moderate", "Challenging"
- Generate exactly the number of questions specified for each section
- answerKey must have one entry per question across all sections, numbered sequentially
- All questions must be relevant to ${data.subject} for Grade ${data.grade} students
- Do not include any text outside the JSON object`;
}
