"use client";

import { ReactNode, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FilterDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  contentClassName?: string;
  // Available filter options extracted from data
  allSubjects: string[];
  allGrades: string[];
  // Applied state
  selectedSubjects: string[];
  selectedGrades: string[];
  selectedStatuses: string[];
  sortBy: string;
  onApply: (filters: {
    selectedSubjects: string[];
    selectedGrades: string[];
    selectedStatuses: string[];
    sortBy: string;
  }) => void;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "due_soon", label: "Due soonest" },
  { value: "due_latest", label: "Due latest" },
];

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "processing", label: "Processing", color: "bg-blue-500" },
  { value: "pending", label: "Pending", color: "bg-gray-400" },
  { value: "failed", label: "Failed", color: "bg-red-500" },
];

export default function FilterDropdown({
  open,
  onOpenChange,
  trigger,
  contentClassName,
  allSubjects,
  allGrades,
  selectedSubjects,
  selectedGrades,
  selectedStatuses,
  sortBy,
  onApply,
}: FilterDropdownProps) {
  const [draftSubjects, setDraftSubjects] = useState<string[]>(selectedSubjects);
  const [draftGrades, setDraftGrades] = useState<string[]>(selectedGrades);
  const [draftStatuses, setDraftStatuses] = useState<string[]>(selectedStatuses);
  const [draftSortBy, setDraftSortBy] = useState<string>(sortBy);

  const toggleSubject = (subject: string) => {
    setDraftSubjects(
      draftSubjects.includes(subject)
        ? draftSubjects.filter((s) => s !== subject)
        : [...draftSubjects, subject]
    );
  };

  const toggleGrade = (grade: string) => {
    setDraftGrades(
      draftGrades.includes(grade)
        ? draftGrades.filter((g) => g !== grade)
        : [...draftGrades, grade]
    );
  };

  const toggleStatus = (status: string) => {
    setDraftStatuses(
      draftStatuses.includes(status)
        ? draftStatuses.filter((s) => s !== status)
        : [...draftStatuses, status]
    );
  };

  const hasActiveFilters =
    draftSubjects.length > 0 ||
    draftGrades.length > 0 ||
    draftStatuses.length > 0 ||
    draftSortBy !== "newest";

  const sameList = (a: string[], b: string[]) =>
    [...a].sort().join("|") === [...b].sort().join("|");

  const hasDraftChanges = !(
    sameList(draftSubjects, selectedSubjects) &&
    sameList(draftGrades, selectedGrades) &&
    sameList(draftStatuses, selectedStatuses) &&
    draftSortBy === sortBy
  );

  const handleClearDraft = () => {
    setDraftSubjects([]);
    setDraftGrades([]);
    setDraftStatuses([]);
    setDraftSortBy("newest");
  };

  const handleApply = () => {
    onApply({
      selectedSubjects: draftSubjects,
      selectedGrades: draftGrades,
      selectedStatuses: draftStatuses,
      sortBy: draftSortBy,
    });
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftSubjects(selectedSubjects);
      setDraftGrades(selectedGrades);
      setDraftStatuses(selectedStatuses);
      setDraftSortBy(sortBy);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={10}
        className={cn(
          "z-50 w-[320px] rounded-2xl border border-black/[0.08] bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md",
          contentClassName,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#1a1a1a]">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearDraft}
              className="text-xs font-semibold text-[#ff6b3d] hover:text-[#e05628] transition"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Sort Section */}
          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#a9a9a9]">
              Sort By
            </h4>
            <Select value={draftSortBy} onValueChange={setDraftSortBy}>
              <SelectTrigger className="h-9 w-full rounded-xl border border-black/[0.08] bg-white text-xs text-[#303030] shadow-none">
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-black/[0.08]">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subjects Section */}
          {allSubjects.length > 0 && (
            <div>
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#a9a9a9]">
                Subject
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allSubjects.map((sub) => {
                  const isSelected = draftSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => toggleSubject(sub)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        isSelected
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-[#f7f7f7] text-[#5e5e5e] border border-transparent hover:bg-black/5"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grades Section */}
          {allGrades.length > 0 && (
            <div>
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#a9a9a9]">
                Grade
              </h4>
              <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {allGrades.map((grade) => {
                  const isSelected = draftGrades.includes(grade);
                  return (
                    <button
                      key={grade}
                      onClick={() => toggleGrade(grade)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        isSelected
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-[#f7f7f7] text-[#5e5e5e] border border-transparent hover:bg-black/5"
                      }`}
                    >
                      {grade.toLowerCase().startsWith("grade") ? grade : `Grade ${grade}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Section */}
          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#a9a9a9]">
              Status
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = draftStatuses.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleStatus(opt.value)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                      isSelected
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-[#f7f7f7] text-[#5e5e5e] hover:bg-black/5"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          disabled={!hasDraftChanges}
          className="mt-5 h-10 w-full rounded-xl bg-[#1a1a1a] text-sm font-semibold text-white transition hover:bg-[#2c2c2c] disabled:cursor-not-allowed disabled:bg-[#d4d4d4] disabled:text-[#8f8f8f]"
        >
          Apply
        </button>
      </PopoverContent>
    </Popover>
  );
}
