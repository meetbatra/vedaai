"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import EmptyState from "@/components/assignments/EmptyState";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileTopBar from "@/components/layout/MobileTopBar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import FilterDropdown from "@/components/assignments/FilterDropdown";

type AssignmentItem = {
  _id: string;
  subject: string;
  grade: string;
  createdAt: string;
  dueDate: string;
  status: string;
};

const ALL_GRADES = Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`);

const normalizeGradeLabel = (grade: string): string => {
  const value = grade.trim();
  const match = value.match(/\d+/);
  if (match?.[0]) {
    return `Grade ${match[0]}`;
  }
  return value.toLowerCase().startsWith("grade")
    ? `Grade ${value.replace(/^grade\s*/i, "").trim()}`
    : value;
};

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Filter & Sort States
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Extract unique filter options from loaded data
  const allSubjects = useMemo(() => {
    return Array.from(new Set(assignments.map((a) => a.subject))).filter(Boolean);
  }, [assignments]);

  const allGrades = ALL_GRADES;

  const handleResetFilters = () => {
    setSelectedSubjects([]);
    setSelectedGrades([]);
    setSelectedStatuses([]);
    setSortBy("newest");
  };

  const handleApplyFilters = (filters: {
    selectedSubjects: string[];
    selectedGrades: string[];
    selectedStatuses: string[];
    sortBy: string;
  }) => {
    setSelectedSubjects(filters.selectedSubjects);
    setSelectedGrades(filters.selectedGrades);
    setSelectedStatuses(filters.selectedStatuses);
    setSortBy(filters.sortBy);
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assignments`,
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAssignments(data.assignments ?? []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleDelete = async (id: string) => {
    // Optimistically remove from UI immediately
    setAssignments((prev) => prev.filter((a) => a._id !== id));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assignments/${id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Failed to delete assignment:", err);
      // Revert: re-fetch assignments to restore deleted item
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assignments`,
        );
        if (res.ok) {
          const data = await res.json();
          setAssignments(data.assignments ?? []);
        }
      } catch {
        // silently ignore refetch failure
      }
    }
  };

  const filtered = useMemo(() => {
    let result = [...assignments];

    // Search filter
    const q = search.toLowerCase();
    if (q) {
      result = result.filter((a) => {
        const displayGrade = normalizeGradeLabel(a.grade);
        return `${a.subject} ${displayGrade}`.toLowerCase().includes(q);
      });
    }

    // Subjects filter
    if (selectedSubjects.length > 0) {
      result = result.filter((a) => selectedSubjects.includes(a.subject));
    }

    // Grades filter
    if (selectedGrades.length > 0) {
      result = result.filter((a) => selectedGrades.includes(normalizeGradeLabel(a.grade)));
    }

    // Statuses filter
    if (selectedStatuses.length > 0) {
      result = result.filter((a) => selectedStatuses.includes(a.status));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "due_soon") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "due_latest") {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [assignments, search, selectedSubjects, selectedGrades, selectedStatuses, sortBy]);

  const hasAssignments = !loading && assignments.length > 0;
  const isEmpty = !loading && assignments.length === 0;

  const activeFiltersCount = selectedSubjects.length + selectedGrades.length + selectedStatuses.length + (sortBy !== "newest" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0;
  const hasSearchOrFilters = search.trim().length > 0 || hasActiveFilters;
  const showNoFilteredResults = !loading && assignments.length > 0 && filtered.length === 0 && hasSearchOrFilters;
  const showNoGradeResults = showNoFilteredResults && selectedGrades.length > 0;

  // ─── DESKTOP ────────────────────────────────────────────────────────────────
  const desktopContent = (
    <div className="hidden h-screen overflow-hidden bg-[#f6f6f6] md:flex">
      <Sidebar activeItem="Assignments" />

      <div className="flex min-w-0 flex-1 flex-col md:ml-[327px] md:mr-[13px]">
        <div className="hidden md:block">
          <TopBar breadcrumb="Assignment" />
        </div>

        <main className="flex-1 overflow-y-auto pb-28 pt-6">
          {loading ? (
            <div className="flex h-full min-h-[300px] w-full items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#24b26b]" />
            </div>
          ) : isEmpty ? (
            <EmptyState />
          ) : (
            <>
              {/* Heading */}
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#24b26b]" />
                <h1 className="text-[44px] font-semibold tracking-[-0.03em] text-[#303030]">
                  Assignments
                </h1>
              </div>
              <p className="mb-7 ml-4 text-[15px] text-[#a9a9a9]">
                Manage and create assignments for your classes.
              </p>

              {/* Filter + Search bar — white container, floats over page */}
              <div className="relative mb-6">
                <div className="flex items-center justify-between gap-4 bg-white p-2 px-3 rounded-2xl">
                  <div className="relative">
                    <FilterDropdown
                      open={desktopFilterOpen}
                      onOpenChange={setDesktopFilterOpen}
                      trigger={(
                        <button
                          id="filter-toggle-btn"
                          type="button"
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                            desktopFilterOpen || hasActiveFilters
                              ? "bg-black/5 text-[#1a1a1a]"
                              : "text-[#5e5e5e] hover:text-[#303030]"
                          }`}
                        >
                          <Image src="/filter.svg" alt="" width={16} height={16} />
                          <span>Filter By</span>
                          {hasActiveFilters && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b3d] text-[10px] font-bold text-white">
                              {activeFiltersCount}
                            </span>
                          )}
                        </button>
                      )}
                      allSubjects={allSubjects}
                      allGrades={allGrades}
                      selectedSubjects={selectedSubjects}
                      selectedGrades={selectedGrades}
                      selectedStatuses={selectedStatuses}
                      sortBy={sortBy}
                      onApply={handleApplyFilters}
                    />
                  </div>

                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a9a9a9]"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search Assignment"
                      className="h-10 w-[300px] rounded-full border border-black/[0.08] bg-white/70 px-4 pl-11 text-sm text-[#303030] outline-none placeholder:text-[#a9a9a9] focus:ring-2 focus:ring-[#ff6b3d]"
                    />
                  </div>
                </div>

                {/* Active filter chips list */}
                {hasActiveFilters && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 px-1">
                    <span className="text-xs font-semibold text-[#a9a9a9]">Active:</span>
                    {selectedSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-black/[0.06] pl-2.5 pr-1.5 py-1 text-xs font-medium text-[#303030] shadow-sm"
                      >
                        <span>{sub}</span>
                        <button
                          onClick={() => setSelectedSubjects((prev) => prev.filter((s) => s !== sub))}
                          className="hover:bg-black/5 p-0.5 rounded-full text-[#a9a9a9] hover:text-[#303030] transition"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {selectedGrades.map((grade) => (
                      <span
                        key={grade}
                        className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-black/[0.06] pl-2.5 pr-1.5 py-1 text-xs font-medium text-[#303030] shadow-sm"
                      >
                        <span>{grade}</span>
                        <button
                          onClick={() => setSelectedGrades((prev) => prev.filter((g) => g !== grade))}
                          className="hover:bg-black/5 p-0.5 rounded-full text-[#a9a9a9] hover:text-[#303030] transition"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {selectedStatuses.map((status) => (
                      <span
                        key={status}
                        className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-black/[0.06] pl-2.5 pr-1.5 py-1 text-xs font-medium text-[#303030] shadow-sm"
                      >
                        <span className="capitalize">{status}</span>
                        <button
                          onClick={() => setSelectedStatuses((prev) => prev.filter((s) => s !== status))}
                          className="hover:bg-black/5 p-0.5 rounded-full text-[#a9a9a9] hover:text-[#303030] transition"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {sortBy !== "newest" && (
                      <span
                        key={sortBy}
                        className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-black/[0.06] pl-2.5 pr-1.5 py-1 text-xs font-medium text-[#303030] shadow-sm"
                      >
                        <span>
                          Sort: {sortBy === "oldest" ? "Oldest" : sortBy === "due_soon" ? "Due soonest" : "Due latest"}
                        </span>
                        <button
                          onClick={() => setSortBy("newest")}
                          className="hover:bg-black/5 p-0.5 rounded-full text-[#a9a9a9] hover:text-[#303030] transition"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-[#ff6b3d] hover:text-[#e05628] transition ml-1"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Cards grid */}
              {showNoFilteredResults ? (
                showNoGradeResults ? (
                  <EmptyState
                    title="No segments found"
                    subtitle="No segments found for this grade."
                    showCreateButton={false}
                  />
                ) : (
                  <div className="rounded-2xl border border-black/[0.08] bg-white/70 px-6 py-10 text-center text-sm text-[#6f6f6f]">
                    No assignments match the selected filters.
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {filtered.map((a) => (
                    <AssignmentCard
                      key={a._id}
                      id={a._id}
                      title={a.subject}
                      assignedOn={a.createdAt}
                      dueDate={a.dueDate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Progressive blur scrim + Create button (desktop) */}
        {hasAssignments && (
          <>
            {/* Exact Figma specs:
                h=73px, left=315px, gradient rgba(234,234,234,0)→rgba(218,218,218,1)
                Progressive blur: start=0 at top, end=40px at bottom
                Simulated with backdrop-filter:blur(40) + CSS mask to fade blur in from top */}
            <div
              className="pointer-events-none fixed bottom-0 left-[315px] right-[13px] z-40 hidden h-[100px] md:block"
              style={{
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                background:
                  "linear-gradient(to bottom, rgba(234,234,234,0) 0%, rgba(218,218,218,1) 100%)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 100%)",
              }}
            />
            <button
              onClick={() => router.push("/assignments/new")}
              className="fixed bottom-5 z-50 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-[#1a1a1a] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(0,0,0,0.22)] md:flex hover:bg-[#333] transition"
              style={{ left: "calc(315px + (100vw - 328px) / 2)" }}
            >
              <Plus size={16} />
              <span>Create Assignment</span>
            </button>
          </>
        )}



      </div>
    </div>
  );

  // ─── MOBILE ─────────────────────────────────────────────────────────────────
  const mobileContent = (
    <div className="flex min-h-screen flex-col bg-[#CECECE] pb-28 md:hidden">
      <MobileTopBar />

      <main className="flex-1 px-[14px] pt-4">
        {/* Mobile page header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25"
          >
            <ArrowLeft size={18} className="text-[#303030]" />
          </button>
          <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#303030]">
            Assignments
          </span>
        </div>

        {loading ? (
          <div className="flex h-full min-h-[200px] w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[#24b26b]" />
          </div>
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {/* Mobile filter + search — no solid background */}
            <div className="relative mb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="relative">
                  <FilterDropdown
                    open={mobileFilterOpen}
                    onOpenChange={setMobileFilterOpen}
                    trigger={(
                      <button
                        id="filter-toggle-btn-mobile"
                        type="button"
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium transition ${
                          mobileFilterOpen || hasActiveFilters
                            ? "bg-black/5 text-[#1a1a1a]"
                            : "text-[#5e5e5e]"
                        }`}
                      >
                        <Image src="/filter.svg" alt="" width={14} height={14} />
                        <span>Filter By</span>
                        {hasActiveFilters && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b3d] text-[9px] font-bold text-white px-1">
                            {activeFiltersCount}
                          </span>
                        )}
                      </button>
                    )}
                    allSubjects={allSubjects}
                    allGrades={allGrades}
                    selectedSubjects={selectedSubjects}
                    selectedGrades={selectedGrades}
                    selectedStatuses={selectedStatuses}
                    sortBy={sortBy}
                    onApply={handleApplyFilters}
                  />
                </div>
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a9a9a9]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Assignment"
                    className="h-9 w-[180px] rounded-full border border-black/[0.08] bg-white/70 pl-9 pr-3 text-[13px] text-[#303030] outline-none placeholder:text-[#a9a9a9]"
                  />
                </div>
              </div>

              {/* Active filter chips list (mobile) */}
              {hasActiveFilters && (
                <div className="mt-2 flex flex-wrap items-center gap-1 px-1">
                  {selectedSubjects.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-black/[0.06] pl-2 pr-1 py-0.5 text-[11px] font-medium text-[#303030] shadow-sm"
                    >
                      <span>{sub}</span>
                      <button
                        onClick={() => setSelectedSubjects((prev) => prev.filter((s) => s !== sub))}
                        className="hover:bg-black/5 p-0.5 rounded-full text-[#a9a9a9] hover:text-[#303030] transition"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {selectedGrades.map((grade) => (
                    <span
                      key={grade}
                      className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-black/[0.06] pl-2 pr-1 py-0.5 text-[11px] font-medium text-[#303030] shadow-sm"
                    >
                      <span>{grade}</span>
                      <button
                        onClick={() => setSelectedGrades((prev) => prev.filter((g) => g !== grade))}
                        className="hover:bg-black/5 p-0.5 rounded-full text-[#a9a9a9] hover:text-[#303030] transition"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {selectedStatuses.map((status) => (
                    <span
                      key={status}
                      className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-black/[0.06] pl-2 pr-1 py-0.5 text-[11px] font-medium text-[#303030] shadow-sm"
                    >
                      <span className="capitalize">{status}</span>
                      <button
                        onClick={() => setSelectedStatuses((prev) => prev.filter((s) => s !== status))}
                        className="hover:bg-black/5 p-0.5 rounded-full text-[#a9a9a9] hover:text-[#303030] transition"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {sortBy !== "newest" && (
                    <span
                      key={sortBy}
                      className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-black/[0.06] pl-2 pr-1 py-0.5 text-[11px] font-medium text-[#303030] shadow-sm"
                    >
                      <span>
                        {sortBy === "oldest" ? "Oldest" : sortBy === "due_soon" ? "Due soon" : "Due late"}
                      </span>
                      <button
                        onClick={() => setSortBy("newest")}
                        className="hover:bg-black/5 p-0.5 rounded-full text-[#a9a9a9] hover:text-[#303030] transition"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-[#ff6b3d] hover:text-[#e05628] transition ml-1"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Cards list (single column on mobile) */}
            {showNoFilteredResults ? (
              showNoGradeResults ? (
                <EmptyState
                  title="No segments found"
                  subtitle="No segments found for this grade."
                  showCreateButton={false}
                />
              ) : (
                <div className="rounded-2xl border border-black/[0.08] bg-white/70 px-4 py-8 text-center text-[13px] text-[#6f6f6f]">
                  No assignments match the selected filters.
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((a) => (
                  <AssignmentCard
                    key={a._id}
                    id={a._id}
                    title={a.subject}
                    assignedOn={a.createdAt}
                    dueDate={a.dueDate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile FAB — + button */}
      {hasAssignments && (
        <button
          onClick={() => router.push("/assignments/new")}
          className="fixed bottom-[94px] right-3 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#ff5623] shadow-[0_8px_24px_rgba(0,0,0,0.16)] md:hidden"
        >
          <Plus size={24} strokeWidth={2.2} />
        </button>
      )}

      <MobileBottomNav />
    </div>
  );

  return (
    <>
      {desktopContent}
      {mobileContent}
    </>
  );
}
