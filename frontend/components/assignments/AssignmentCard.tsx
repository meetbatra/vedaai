"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";

type AssignmentCardProps = {
  title: string;
  assignedOn: string;
  dueDate: string;
};

export default function AssignmentCard({
  title,
  assignedOn,
  dueDate,
}: AssignmentCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 underline underline-offset-2">
          {title}
        </h2>

        <div className="relative">
          <MoreVertical
            size={18}
            className="cursor-pointer text-gray-400"
            onClick={() => setOpen((value) => !value)}
          />

          {open ? (
            <div className="absolute right-0 top-6 z-50 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              <div className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                View Assignment
              </div>
              <div className="cursor-pointer px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                Delete
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-gray-900">
        <span>
          <span className="font-semibold">Assigned on</span>
          <span className="text-gray-500"> : {assignedOn}</span>
        </span>
        <span>
          <span className="font-semibold">Due</span>
          <span className="text-gray-500"> : {dueDate}</span>
        </span>
      </div>
    </div>
  );
}
