"use client";

import { Minus, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StepOneFormProps = {
  subject: string;
  grade: string;
  className: string;
  timeAllowed: string;
  onSubjectChange: (v: string) => void;
  onGradeChange: (v: string) => void;
  onClassNameChange: (v: string) => void;
  onTimeAllowedChange: (v: string) => void;
};

const GRADES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const SECTIONS = ["A", "B", "C", "D"];

export default function StepOneForm({
  subject,
  grade,
  className,
  timeAllowed,
  onSubjectChange,
  onGradeChange,
  onClassNameChange,
  onTimeAllowedChange,
}: StepOneFormProps) {
  const timeValue = parseInt(timeAllowed) || 45;

  const handleDecrease = () => {
    const newValue = Math.max(5, timeValue - 5);
    onTimeAllowedChange(newValue.toString());
  };

  const handleIncrease = () => {
    const newValue = timeValue + 5;
    onTimeAllowedChange(newValue.toString());
  };

  return (
    <>
      <h2 className="mb-1 text-[28px] font-semibold tracking-[-0.02em] text-[#303030] md:text-[22px]">
        Assignment Details
      </h2>
      <p className="mb-6 text-sm text-[#5e5e5e] md:text-[#a9a9a9]">
        Tell us about your assignment
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#303030]">
            Subject
          </label>
          <input
            type="text"
            placeholder="e.g. Science, Mathematics, English"
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
            className="h-12 w-full rounded-2xl border border-[#dadada] !bg-white px-4 text-sm text-[#303030] outline-none placeholder:text-[#a9a9a9] focus:border-[#1a1a1a] focus:ring-0"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#303030]">
              Grade
            </label>
            <Select value={grade} onValueChange={onGradeChange}>
              <SelectTrigger className="!h-12 w-full rounded-2xl border border-[#dadada] !bg-white px-4 text-sm text-[#303030] shadow-none outline-none focus:border-[#1a1a1a] focus:ring-0 focus-visible:ring-0 [&>span]:line-clamp-1">
                <span className="truncate">
                  {grade ? `Grade ${grade}` : "Select Grade"}
                </span>
              </SelectTrigger>
              <SelectContent className="border-[#dadada] bg-white max-h-[200px] overflow-y-auto">
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g} className="text-sm text-[#303030] cursor-pointer">
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#303030]">
              Section
            </label>
            <Select value={className} onValueChange={onClassNameChange}>
              <SelectTrigger className="!h-12 w-full rounded-2xl border border-[#dadada] !bg-white px-4 text-sm text-[#303030] shadow-none outline-none focus:border-[#1a1a1a] focus:ring-0 focus-visible:ring-0 [&>span]:line-clamp-1">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent className="border-[#dadada] bg-white">
                {SECTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="text-sm text-[#303030] cursor-pointer">
                    Section {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#303030]">
            Time Allowed (minutes)
          </label>
          <div className="flex h-12 w-full select-none items-center justify-between rounded-2xl border border-[#dadada] !bg-white px-4">
            <button
              type="button"
              onClick={handleDecrease}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5] text-[#303030] hover:bg-[#ececec] transition-colors cursor-pointer"
              aria-label="Decrease time"
            >
              <Minus size={18} />
            </button>
            <span className="text-base font-semibold text-[#303030]">
              {timeValue} minutes
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5] text-[#303030] hover:bg-[#ececec] transition-colors cursor-pointer"
              aria-label="Increase time"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
