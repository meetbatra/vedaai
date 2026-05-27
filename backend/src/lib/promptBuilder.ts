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
          "options": ["Option A", "Option B", "Option C", "Option D"],
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
- difficulty must be exactly one of: "Easy", "Moderate", "Challenging". Ensure the questions' difficulty level is strictly appropriate and carefully calibrated for Grade ${data.grade} students. The model should think carefully about age-appropriate complexity.
- Generate exactly the number of questions specified for each section
- For each section, the "questionType" field MUST exactly match the requested question type from the "Sections required" list.
- Tailor the questions to their specific "questionType":
  * If the type is "Multiple Choice Questions" (or similar MCQ), you MUST include an "options" array with exactly 4 distinct choices in the question object.
  * If the type involves blanks (e.g., "Fill in the Blanks"), the "text" MUST contain appropriate blank spaces (e.g., "______").
  * If the type requires diagrams or graphs, phrase the "text" to explicitly ask the student to draw or plot a specific graph/diagram.
  * If the type is a short answer, frame it as a concise single-statement question.
  * Do NOT include the "options" array for non-MCQ questions.
- answerKey must have one entry per question across all sections, numbered sequentially
- All questions must be relevant to ${data.subject}. Always provide questions that are exactly according to Grade ${data.grade} standards.
- Do not include any text outside the JSON object`;
}
