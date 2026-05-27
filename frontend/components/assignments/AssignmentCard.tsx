"use client";

import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

type AssignmentCardProps = {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  onDelete?: (id: string) => void;
};

export default function AssignmentCard({
  id,
  title,
  assignedOn,
  dueDate,
  onDelete,
}: AssignmentCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd-MM-yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-3xl bg-white px-6 py-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-black/[0.06] min-h-[162px]">
      {/* Title row — no link, no underline */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold leading-snug text-[#1a1a1a] md:text-[22px]">
          {title}
        </h2>

        {/* Three-dot menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#a9a9a9] hover:bg-black/5 transition"
          >
            <MoreVertical size={17} />
          </button>

          {open && (
            <div className="absolute right-0 top-8 z-50 w-44 rounded-2xl border border-black/[0.07] bg-white py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#303030] hover:bg-[#f7f7f7] transition"
                onClick={() => {
                  setOpen(false);
                  router.push(`/assignments/${id}`);
                }}
              >
                View Assignment
              </button>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#e03c3c] hover:bg-[#fff4f4] transition"
                onClick={() => {
                  setOpen(false);
                  onDelete?.(id);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dates row */}
      <div className="flex items-center gap-6 text-[13px] text-[#303030]">
        <span>
          <span className="font-semibold">Assigned on</span>
          <span className="text-[#6b6b6b]"> : {formatDate(assignedOn)}</span>
        </span>
        <span>
          <span className="font-semibold">Due</span>
          <span className="text-[#6b6b6b]"> : {formatDate(dueDate)}</span>
        </span>
      </div>
    </div>
  );
}
