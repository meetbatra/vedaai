"use client";

import Image from "next/image";
import { Plus } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center px-6 pb-0 pt-10 md:justify-center md:py-4">
      <div className="flex h-[220px] w-[220px] items-center justify-center md:h-auto md:w-auto">
        <Image
          src="/not_found.svg"
          alt="No assignments illustration"
          width={220}
          height={220}
          className="h-[220px] w-[220px] object-contain md:h-auto md:w-auto"
          unoptimized
          priority
        />
      </div>

      <h2 className="mt-3 text-center text-[28px] font-semibold tracking-[-0.03em] text-[#303030] md:mt-0 md:text-[34px]">
        No assignments yet
      </h2>

      <p className="mt-3 max-w-[316px] text-center text-[14px] leading-6 text-[#5f5f5f] md:max-w-[560px] md:text-[15px] md:leading-7">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let
        AI assist with grading.
      </p>

      <button className="mt-8 flex h-11 items-center gap-2 rounded-full bg-[#181818] px-6 text-sm font-medium text-white md:mt-1 md:py-3">
        <Plus size={16} />
        <span>Create Your First Assignment</span>
      </button>
    </div>
  );
}
