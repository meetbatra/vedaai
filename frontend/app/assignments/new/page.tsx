"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  Plus,
  UploadCloud,
} from "lucide-react";
import { format } from "date-fns";
import { useRef, useState } from "react";
import QuestionTypeRow from "@/components/assignments/QuestionTypeRow";
import StepOneForm from "@/components/assignments/StepOneForm";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileTopBar from "@/components/layout/MobileTopBar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type QuestionType = {
  id: string;
  type: string;
  questionCount: number;
  marks: number;
};

export default function NewAssignmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [timeAllowed, setTimeAllowed] = useState("45");
  const [dueDate, setDueDate] = useState<Date>();
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    {
      id: "1",
      type: "Multiple Choice Questions",
      questionCount: 4,
      marks: 1,
    },
  ]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setUploadedFile(null);
      setFileError(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    const maxFileSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setUploadedFile(null);
      setFileError("Only JPEG and PNG files are allowed.");
      return;
    }

    if (file.size > maxFileSize) {
      setUploadedFile(null);
      setFileError("File size must be 10MB or less.");
      return;
    }

    setUploadedFile(file);
    setFileError(null);
  };

  const totalQuestions = questionTypes.reduce(
    (sum, questionType) => sum + questionType.questionCount,
    0,
  );
  const totalMarks = questionTypes.reduce(
    (sum, questionType) => sum + questionType.questionCount * questionType.marks,
    0,
  );

  const addQuestionType = () => {
    setQuestionTypes((current) => [
      ...current,
      {
        id: Date.now().toString(),
        type: "Short Questions",
        questionCount: 1,
        marks: 1,
      },
    ]);
  };

  const removeQuestionType = (id: string) => {
    setQuestionTypes((current) =>
      current.filter((questionType) => questionType.id !== id),
    );
  };

  const updateQuestionType = <K extends keyof QuestionType>(
    id: string,
    field: K,
    value: QuestionType[K],
  ) => {
    setQuestionTypes((current) =>
      current.map((questionType) =>
        questionType.id === id ? { ...questionType, [field]: value } : questionType,
      ),
    );
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      router.push("/assignments");
      return;
    }

    setCurrentStep(1);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (
        !subject.trim() ||
        !grade.trim() ||
        !className.trim() ||
        !timeAllowed.trim()
      ) {
        alert("Please fill in all fields before continuing.");
        return;
      }

      setCurrentStep(2);
      return;
    }

    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        subject,
        grade,
        className,
        timeAllowed,
        dueDate: dueDate.toISOString(),
        questionTypes,
        additionalInfo,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create assignment");
      }

      const data = await response.json();
      router.push(`/assignments/${data.assignmentId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="hidden h-screen overflow-hidden bg-[#eeeeee] md:flex">
        <Sidebar activeItem="Assignments" />

        <div className="flex min-w-0 flex-1 flex-col md:ml-[316px]">
          <div className="hidden md:block">
            <TopBar breadcrumb="Assignment" />
          </div>

          <main className="flex-1 overflow-y-auto px-4 pb-10 pt-6 md:px-8">
            <div className="mx-auto w-full max-w-[810px]">
              <div className="relative mb-1">
                <span className="absolute -left-6 top-[13px] h-2.5 w-2.5 rounded-full bg-[#4bc26d]" />
                <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#303030]">
                  Create Assignment
                </h1>
              </div>

              <p className="mb-6 text-[15px] text-[#a9a9a9]">
                {currentStep === 1
                  ? "Let's start with the basics about your assignment."
                  : "Set up question types and additional details."}
              </p>

              <div className="mb-6 h-1.5 w-full rounded-full bg-[#e5e5e5]">
                <div
                  className={`h-full bg-[#1a1a1a] rounded-full transition-all duration-300 ${currentStep === 1 ? "w-1/2" : "w-full"}`}
                />
              </div>

              <div className="rounded-[32px] bg-[#f5f5f5] p-6 md:p-8">
                {currentStep === 1 ? (
                  <StepOneForm
                    subject={subject}
                    grade={grade}
                    className={className}
                    timeAllowed={timeAllowed}
                    onSubjectChange={setSubject}
                    onGradeChange={setGrade}
                    onClassNameChange={setClassName}
                    onTimeAllowedChange={setTimeAllowed}
                  />
                ) : (
                  <>
                    <h2 className="mb-1 text-[22px] font-semibold tracking-[-0.02em] text-[#303030]">
                      Assignment Details
                    </h2>
                    <p className="mb-6 text-sm text-[#a9a9a9]">
                      Basic information about your assignment
                    </p>

                    <div
                      className={cn(
                        "mb-2 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-[1.75px] border-dashed p-8 text-center transition-colors",
                        isDraggingFile
                          ? "border-[#ff6b3d] bg-[#fff4ef]"
                          : "border-black/20 bg-white",
                      )}
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDraggingFile(true);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!isDraggingFile) {
                          setIsDraggingFile(true);
                        }
                      }}
                      onDragLeave={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDraggingFile(false);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDraggingFile(false);
                        handleFileSelect(event.dataTransfer.files?.[0] ?? null);
                      }}
                    >
                      <UploadCloud size={32} className="text-[#5e5e5e]" />
                      <p className="text-sm font-medium text-[#5e5e5e]">
                        Choose a file or drag &amp; drop it here
                      </p>
                      <p className="text-xs text-[#a9a9a9]">JPEG, PNG, upto 10MB</p>
                      <button
                        type="button"
                        className="rounded-full border border-[#d0d0d0] bg-white px-4 py-1.5 text-xs font-medium text-[#5e5e5e]"
                        onClick={(event) => {
                          event.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Browse Files
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(event) => handleFileSelect(event.target.files?.[0] || null)}
                      />
                      {uploadedFile ? <p className="text-xs text-green-600">{uploadedFile.name}</p> : null}
                      {fileError ? <p className="text-xs text-red-500">{fileError}</p> : null}
                    </div>

                    <p className="mb-6 text-center text-xs text-[#a9a9a9]">
                      Upload images of your preferred document/image
                    </p>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#303030]">Due Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-12 w-full justify-between rounded-2xl border-[#dadada] bg-white px-4 text-left text-sm font-normal text-[#303030] hover:bg-white",
                              !dueDate && "text-[#a9a9a9]",
                            )}
                          >
                            {dueDate ? format(dueDate, "dd-MM-yyyy") : "DD-MM-YYYY"}
                            <Image src="/form_date.svg" alt="" width={20} height={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto border-[#dadada] bg-white p-0" align="start">
                          <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 hidden grid-cols-[1fr_40px_124px_124px] gap-4 px-1 md:grid">
                        <span className="text-sm font-semibold text-[#303030]">Question Type</span>
                        <span />
                        <span className="w-[124px] text-center text-sm font-semibold text-[#303030]">
                          No. of Questions
                        </span>
                        <span className="w-[124px] text-center text-sm font-semibold text-[#303030]">Marks</span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {questionTypes.map((questionType, index) => (
                          <QuestionTypeRow
                            key={questionType.id}
                            index={index}
                            value={questionType.type}
                            questionCount={questionType.questionCount}
                            marks={questionType.marks}
                            onRemove={() => removeQuestionType(questionType.id)}
                            onQuestionCountChange={(value) =>
                              updateQuestionType(questionType.id, "questionCount", value)
                            }
                            onMarksChange={(value) => updateQuestionType(questionType.id, "marks", value)}
                            onTypeChange={(value) => updateQuestionType(questionType.id, "type", value)}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addQuestionType}
                        className="mt-3 flex items-center gap-2 text-sm font-medium text-[#303030]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a]">
                          <Plus size={16} className="text-white" />
                        </span>
                        <span>Add Question Type</span>
                      </button>

                      <div className="mt-4 text-right text-sm text-[#303030]">
                        <p>
                          <span className="font-semibold">Total Questions : </span>
                          {totalQuestions}
                        </p>
                        <p>
                          <span className="font-semibold">Total Marks : </span>
                          {totalMarks}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="mb-2 block text-sm font-semibold text-[#303030]">
                        Additional Information (For better output)
                      </label>
                      <div className="relative">
                        <textarea
                          placeholder="e.g Generate a question paper for 3 hour exam duration..."
                          value={additionalInfo}
                          onChange={(event) => setAdditionalInfo(event.target.value)}
                          className="h-[102px] w-full resize-none rounded-2xl border border-dashed border-[#dadada] bg-white px-4 py-3 pr-12 text-sm text-[#303030] outline-none placeholder:text-[#a9a9a9] focus:border-transparent focus:ring-0"
                        />
                        <Mic size={18} className="absolute bottom-4 right-4 text-[#8f8f8f]" />
                      </div>
                    </div>
                </>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex h-[46px] items-center gap-2 rounded-full border border-[#ececec] bg-white px-6 text-sm font-medium text-[#303030]"
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex h-[46px] items-center gap-2 rounded-full border border-white/20 bg-[#181818] px-6 text-sm font-medium text-white disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Generating..." : "Next"}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="md:hidden">
        <div className="min-h-screen bg-[#CECECE] pb-28">

          <MobileTopBar />

          <main className="px-[22px] pb-8 pt-4">
            <div className="mb-5 flex items-center gap-4">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25"
              >
                <ArrowLeft size={20} className="text-[#303030]" />
              </button>
              <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-[#303030]">
                Create Assignment
              </h1>
            </div>

            <div className="mb-6 h-[5px] w-full rounded-full bg-[#DADADA]">
              <div
                className={`h-full bg-[#1a1a1a] rounded-full transition-all duration-300 ${currentStep === 1 ? "w-1/2" : "w-full"}`}
              />
            </div>

            <div className="rounded-[32px] bg-white/50 p-4 pb-8">
              {currentStep === 1 ? (
                <StepOneForm
                  subject={subject}
                  grade={grade}
                  className={className}
                  timeAllowed={timeAllowed}
                  onSubjectChange={setSubject}
                  onGradeChange={setGrade}
                  onClassNameChange={setClassName}
                  onTimeAllowedChange={setTimeAllowed}
                />
              ) : (
                <>
                  <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-[#303030]">Assignment Details</h2>
                  <p className="mt-1 text-sm text-[#5E5E5E]">Basic information about your assignment</p>

                  <div
                    className={cn(
                      "mt-6 flex cursor-pointer flex-col items-center gap-3 rounded-3xl border border-dashed border-[#DADADA] p-6 text-center transition-colors",
                      isDraggingFile ? "bg-[#ececec] border-[#ff6b3d]" : "bg-[#F6F6F6]",
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDraggingFile(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!isDraggingFile) {
                        setIsDraggingFile(true);
                      }
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDraggingFile(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDraggingFile(false);
                      handleFileSelect(event.dataTransfer.files?.[0] ?? null);
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                      <UploadCloud size={22} className="text-[#2B2B2B]" />
                    </div>
                    <p className="text-sm font-medium text-[#303030]">Choose a file or drag &amp; drop it here</p>
                    <p className="text-xs text-[#5E5E5E]">JPEG, PNG, upto 10MB</p>
                    <button
                      type="button"
                      className="rounded-full border border-[#E5E5E5] bg-white px-4 py-1.5 text-xs font-medium text-[#2B2B2B]"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(event) => handleFileSelect(event.target.files?.[0] || null)}
                    />
                    {uploadedFile ? <p className="text-xs text-green-600">{uploadedFile.name}</p> : null}
                    {fileError ? <p className="text-xs text-red-500">{fileError}</p> : null}
                  </div>

                  <p className="mb-6 mt-3 text-center text-xs text-[#5E5E5E]">
                    Upload images of your preferred document/image
                  </p>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#303030]">Due Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-[43px] w-full justify-between rounded-full border-[#DADADA] bg-transparent px-4 text-left text-sm font-normal text-[#303030] hover:bg-transparent",
                            !dueDate && "text-[#5E5E5E]",
                          )}
                        >
                          {dueDate ? format(dueDate, "dd-MM-yyyy") : "DD-MM-YYYY"}
                          <Image src="/form_date.svg" alt="" width={20} height={20} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto border-[#dadada] bg-white p-0" align="start">
                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="mt-6">
                    <label className="mb-2.5 block text-sm font-semibold text-[#303030]">Question Type</label>
                    <div className="flex flex-col gap-4">
                      {questionTypes.map((questionType, index) => (
                        <QuestionTypeRow
                          key={questionType.id}
                          index={index}
                          value={questionType.type}
                          questionCount={questionType.questionCount}
                          marks={questionType.marks}
                          onRemove={() => removeQuestionType(questionType.id)}
                          onQuestionCountChange={(value) =>
                            updateQuestionType(questionType.id, "questionCount", value)
                          }
                          onMarksChange={(value) => updateQuestionType(questionType.id, "marks", value)}
                          onTypeChange={(value) => updateQuestionType(questionType.id, "type", value)}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addQuestionType}
                      className="mt-4 flex items-center gap-3 text-sm font-medium text-[#303030]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B2B2B]">
                        <Plus size={16} className="text-white" />
                      </span>
                      <span>Add Question type</span>
                    </button>

                    <div className="mt-5 text-right text-sm text-[#303030]">
                      <p>
                        <span className="font-semibold">Total Questions : </span> {totalQuestions}
                      </p>
                      <p>
                        <span className="font-semibold">Total Marks : </span> {totalMarks}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold text-[#2B2B2B]">
                      Additional Information (For better output)
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="e.g Generate a question paper for 3 hour exam duration..."
                        value={additionalInfo}
                        onChange={(event) => setAdditionalInfo(event.target.value)}
                        className="h-[120px] w-full resize-none rounded-3xl bg-white px-4 py-3 pr-12 text-sm text-[#303030] outline-none placeholder:text-[#5E5E5E] focus:border-transparent focus:outline-none focus:ring-0"
                      />
                      <Mic size={18} className="absolute bottom-4 right-4 text-[#8f8f8f]" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between px-12">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex h-[46px] w-[134px] items-center justify-center gap-2 rounded-full bg-white text-sm font-medium text-[#303030]"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex h-[46px] w-[130px] items-center justify-center gap-2 rounded-full bg-[#181818] text-sm font-medium text-white shadow-[0_16px_24px_rgba(0,0,0,0.12),0_32px_24px_rgba(0,0,0,0.2)] disabled:opacity-50"
              >
                <span>{isSubmitting ? "Generating..." : "Next"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </>
  );
}
