"use client";

import Image from "next/image";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Menu,
} from "lucide-react";
import { useState } from "react";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import EmptyState from "@/components/assignments/EmptyState";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

type AssignmentItem = {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
};

export default function AssignmentsPage() {
  const [assignments] = useState<AssignmentItem[]>([]);
  const hasAssignments = assignments.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#cecece] md:bg-[#f6f6f6]">
      <Sidebar activeItem="Assignments" />

      <div className="flex min-w-0 flex-1 flex-col md:ml-[327px] md:mr-[13px]">
        <div className="hidden md:block">
          <TopBar breadcrumb="Assignment" />
        </div>

        <header className="z-40 px-[10px] pt-3 md:hidden">
          <div className="flex h-14 items-center rounded-2xl bg-white px-3">
            <Image
              src="/mobile_logo.svg"
              alt="VedaAI logo"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0"
              unoptimized
              priority
            />
            <span className="ml-2 text-[19px] font-semibold tracking-[-0.03em] text-[#303030]">
              VedaAI
            </span>

            <div className="ml-auto flex items-center gap-3">
              <Image
                src="/bell.svg"
                alt="Notifications"
                width={36}
                height={36}
                className="h-9 w-9"
                unoptimized
              />
              <div className="h-8 w-8 rounded-full bg-[#f6f6f6]" />
              <button
                aria-label="Open menu"
                className="flex h-8 w-8 items-center justify-center"
              >
                <Menu size={18} className="text-[#1d1b20]" />
              </button>
            </div>
          </div>
        </header>

        <main
          className={[
            "flex-1 px-4 md:px-0",
            hasAssignments
              ? "overflow-y-auto pb-28 pt-6 md:pb-10"
              : "overflow-hidden px-0 pb-[118px] pt-0",
          ].join(" ")}
        >
          {hasAssignments ? (
            <>
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#24b26b]" />
                <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#303030]">
                  Assignments
                </h1>
              </div>

              <p className="mb-7 ml-4 text-[15px] text-[#a9a9a9]">
                Manage and create assignments for your classes.
              </p>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#5e5e5e]">
                  <SlidersHorizontal size={16} />
                  <span>Filter By</span>
                </div>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9a9a9]"
                  />
                  <input
                    placeholder="Search Assignment"
                    className="h-12 w-full rounded-full border border-white bg-white px-4 pl-11 text-sm text-[#303030] shadow-[0_10px_28px_rgba(0,0,0,0.06)] outline-none placeholder:text-[#a9a9a9] focus:ring-2 focus:ring-[#ff6b3d] sm:w-[280px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} {...assignment} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </main>

        {hasAssignments ? (
          <button className="fixed bottom-6 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-white shadow-xl md:flex">
            <Plus size={16} />
            <span>Create Assignment</span>
          </button>
        ) : null}

        <div className="fixed bottom-6 left-1/2 z-50 flex h-[72px] w-[calc(100%-20px)] max-w-[373px] -translate-x-1/2 items-center justify-around rounded-3xl bg-[#181818] shadow-[0_32px_24px_rgba(0,0,0,0.2),0_16px_24px_rgba(0,0,0,0.12)] md:hidden">
          <div className="flex flex-col items-center gap-1 text-[11px]">
            <Image
              src="/mobile_home.svg"
              alt="Home"
              width={18}
              height={18}
              unoptimized
            />
            <span className="text-white/25">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-[11px]">
            <Image
              src="/mobile_assignments.svg"
              alt="Assignments"
              width={20}
              height={20}
              unoptimized
            />
            <span className="text-white">Assignments</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-[11px]">
            <Image
              src="/mobile_library.svg"
              alt="Library"
              width={20}
              height={20}
              unoptimized
            />
            <span className="text-white/25">Library</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-[11px]">
            <Image
              src="/mobile_toolkit.svg"
              alt="AI Toolkit"
              width={20}
              height={20}
              unoptimized
            />
            <span className="text-white/25">AI Toolkit</span>
          </div>
        </div>

        <button className="fixed bottom-[109px] right-[10px] z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#ff5623] shadow-[0_32px_24px_rgba(0,0,0,0.2),0_16px_24px_rgba(0,0,0,0.12)] md:hidden">
          <Plus size={24} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
