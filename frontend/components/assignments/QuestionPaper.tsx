import React from "react"
import { Assignment } from "@/types/assignment"

interface QuestionPaperProps {
  assignment: Assignment
}

export default function QuestionPaper({ assignment }: QuestionPaperProps) {
  const result = assignment.result
  if (!result) return null

  const school = result.school || "Delhi Public School, Sector-4, Bokaro"
  const subject = result.subject || assignment.subject
  const className = result.className || assignment.className
  const gradeVal = result.grade || assignment.grade || ""
  const displayGrade = gradeVal.toLowerCase().startsWith("grade") ? gradeVal : `Grade ${gradeVal}`
  const timeAllowed = result.timeAllowed || assignment.timeAllowed
  const totalMarks = result.totalMarks || assignment.questionTypes?.reduce((acc, qt) => acc + (qt.questionCount * qt.marks), 0) || 0

  return (
    <div
      id="question-paper-content"
      className="bg-white max-w-3xl mx-auto p-8 md:p-12 font-sans text-[#303030]"
    >
      {/* HEADER SECTION */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">{school}</h1>
        <div className="text-lg font-semibold mt-1">Subject: {subject}</div>
        <div className="text-lg font-semibold">{displayGrade} - Section {className}</div>
      </div>

      <div className="border-t border-black/10 my-6" />

      {/* META ROW */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-semibold">Time Allowed: {timeAllowed} minutes</div>
        <div className="text-sm font-semibold">Maximum Marks: {totalMarks}</div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="text-[15px] font-bold mb-8">
        {result.instructions || "All questions are compulsory unless stated otherwise."}
      </div>

      {/* STUDENT INFO LINES */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="text-[15px]">Name: ___________________</div>
        <div className="text-[15px]">Roll Number: _______________</div>
        <div className="text-[15px]">Class: {displayGrade} Section: {className}</div>
      </div>

      {/* SECTIONS */}
      {result.sections && result.sections.length > 0 ? (
        result.sections.map((section, idx) => (
          <div key={idx} className="mb-8">
            <div className="text-center font-bold text-[17px] my-6">{section.title}</div>
            <div className="text-[15px] font-bold mb-1">{section.questionType}</div>
            <div className="text-sm italic text-[#5E5E5E] mb-4">{section.instruction}</div>
            
            <div className="flex flex-col gap-1">
              {section.questions.map((q) => (
                <div key={q.number} className="flex items-start gap-2 mb-3 text-[15px]">
                  <span className="font-medium shrink-0">{q.number}.</span>
                  <div className="flex-1 leading-relaxed">
                    <span>
                      <span
                        className={`inline-flex items-center justify-center text-[11px] font-medium px-2 py-[2px] rounded mr-2 ${
                          q.difficulty === "Easy"
                            ? "bg-[#e8f7ec] text-[#2c8a4a]"
                            : q.difficulty === "Moderate"
                            ? "bg-[#fff8e6] text-[#b38600]"
                            : "bg-[#fde9e9] text-[#c92a2a]"
                        }`}
                      >
                        {q.difficulty || "Easy"}
                      </span>
                      {q.text}
                      <span className="text-[13px] text-[#8c8c8c] ml-1.5 font-medium">
                        [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-sm text-gray-500 py-10">No sections found in the generated question paper.</div>
      )}

      <div className="text-center font-bold text-[15px] my-10 border-t border-b border-black/10 py-3">
        End of Question Paper
      </div>

      {/* ANSWER KEY */}
      {result.answerKey && result.answerKey.length > 0 && (
        <div className="mt-12 pt-8">
          <div className="text-lg font-bold mb-6">Answer Key:</div>
          <div className="flex flex-col gap-4">
            {result.answerKey.map((item) => (
              <div key={item.number} className="text-[15px] flex gap-3">
                <span className="font-medium shrink-0">{item.number}.</span>
                <span className="leading-relaxed">{item.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
