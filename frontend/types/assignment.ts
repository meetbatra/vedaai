export interface Question {
  number: number
  text: string
  options?: string[]
  difficulty: "Easy" | "Moderate" | "Challenging"
  marks: number
}

export interface Section {
  title: string
  questionType: string
  instruction: string
  questions: Question[]
}

export interface AnswerKeyItem {
  number: number
  answer: string
}

export interface AssignmentResult {
  school: string
  subject: string
  grade: string
  className: string
  timeAllowed: number
  totalMarks: number
  instructions: string
  sections: Section[]
  answerKey: AnswerKeyItem[]
}

export interface Assignment {
  _id: string
  subject: string
  grade: string
  className: string
  timeAllowed: string
  dueDate: string
  questionTypes: Array<{ type: string, questionCount: number, marks: number }>
  additionalInfo?: string
  status: "pending" | "processing" | "completed" | "failed"
  jobId?: string
  result?: AssignmentResult
  createdAt: string
  updatedAt: string
}
