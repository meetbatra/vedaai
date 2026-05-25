import { Minus, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";


export const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False",
  "Fill in the Blanks",
];

type QuestionTypeRowProps = {
  index: number;
  value: string;
  questionCount: number;
  marks: number;
  showSectionLabel?: boolean;
  onRemove: () => void;
  onQuestionCountChange: (n: number) => void;
  onMarksChange: (n: number) => void;
  onTypeChange: (v: string) => void;
};

function Counter({
  value,
  onDecrease,
  onIncrease,
  className,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 min-w-[124px] select-none items-center justify-center gap-3 rounded-full bg-white px-4",
        className
      )}
    >
      <button
        type="button"
        onClick={onDecrease}
        aria-label="Decrease value"
        className="flex h-5 w-5 items-center justify-center text-[#5e5e5e] select-none cursor-pointer"
      >
        <Minus size={14} />
      </button>
      <span className="w-4 select-none text-center text-sm text-[#303030]">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Increase value"
        className="flex h-5 w-5 items-center justify-center text-[#5e5e5e] select-none cursor-pointer"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function QuestionTypeRow({
  value,
  questionCount,
  marks,
  showSectionLabel = false,
  onRemove,
  onQuestionCountChange,
  onMarksChange,
  onTypeChange,
}: QuestionTypeRowProps) {
  return (
    <div>
      <div className="hidden grid-cols-[1fr_40px_124px_124px] items-center gap-4 md:grid">
        <Select value={value} onValueChange={onTypeChange}>
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-white px-4 text-sm text-[#303030] data-[size=default]:h-12 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-orange-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#dadada] bg-white">
            {QUESTION_TYPES.map((questionType) => (
              <SelectItem
                key={questionType}
                value={questionType}
                className="text-sm text-[#303030]"
              >
                {questionType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={onRemove}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X size={18} className="cursor-pointer" />
        </button>

        <Counter
          value={questionCount}
          onDecrease={() =>
            onQuestionCountChange(Math.max(1, questionCount - 1))
          }
          onIncrease={() => onQuestionCountChange(questionCount + 1)}
        />

        <Counter
          value={marks}
          onDecrease={() => onMarksChange(Math.max(1, marks - 1))}
          onIncrease={() => onMarksChange(marks + 1)}
        />
      </div>

      <div className="md:hidden">
        <div className="rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <Select value={value} onValueChange={onTypeChange}>
              <SelectTrigger className="h-auto w-fit gap-1.5 border-0 bg-transparent p-0 text-[15px] font-semibold text-[#303030] shadow-none hover:bg-transparent focus:bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none [&>span]:line-clamp-1 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-[#6B7280]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#dadada] bg-white">
                {QUESTION_TYPES.map((questionType) => (
                  <SelectItem
                    key={questionType}
                    value={questionType}
                    className="text-sm text-[#303030]"
                  >
                    {questionType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
              <X size={18} className="cursor-pointer" />
            </button>
          </div>

          <div className="rounded-xl bg-[#F6F6F6] p-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <p className="mb-1.5 text-[11px] font-semibold text-[#5E5E5E] text-center">
                  No. of Questions
                </p>
                <Counter
                  value={questionCount}
                  className="h-9 min-w-0 w-full px-3"
                  onDecrease={() =>
                    onQuestionCountChange(Math.max(1, questionCount - 1))
                  }
                  onIncrease={() => onQuestionCountChange(questionCount + 1)}
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-1.5 text-[11px] font-semibold text-[#5E5E5E] text-center">
                  Marks
                </p>
                <Counter
                  value={marks}
                  className="h-9 min-w-0 w-full px-3"
                  onDecrease={() => onMarksChange(Math.max(1, marks - 1))}
                  onIncrease={() => onMarksChange(marks + 1)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

