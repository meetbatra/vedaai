"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Sidebar from "@/components/layout/Sidebar"
import TopBar from "@/components/layout/TopBar"
import MobileTopBar from "@/components/layout/MobileTopBar"
import MobileBottomNav from "@/components/layout/MobileBottomNav"
import QuestionPaper from "@/components/assignments/QuestionPaper"
import { downloadAssignmentPdf } from "@/lib/generatePdf"
import { Assignment } from "@/types/assignment"
import { useSocket } from "@/hooks/useSocket"
import { Loader2, Download, RefreshCw, ArrowLeft } from "lucide-react"

type AssignmentProcessingEvent = {
  assignmentId: string
  status: "processing"
}

type AssignmentCompletedEvent = {
  assignmentId: string
  status: "completed"
  result: unknown
}

type AssignmentFailedEvent = {
  assignmentId: string
  status: "failed"
  error: string
}

export default function AssignmentOutputPage() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()
  const socket = useSocket()

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<boolean>(false)

  const fetchAssignment = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assignments/${id}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setAssignment(data.assignment)
      setError(null)
    } catch {
      setError("Failed to load assignment")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchAssignment()
  }, [fetchAssignment])

  useEffect(() => {
    if (!id) return

    const subscribeToAssignment = () => {
      socket.emit("assignment:subscribe", id)
    }

    const onAssignmentProcessing = (event: AssignmentProcessingEvent) => {
      if (event.assignmentId !== id) return
      setAssignment((current) => {
        if (!current) return current
        return { ...current, status: event.status }
      })
      setLoading(false)
    }

    const onAssignmentCompleted = (event: AssignmentCompletedEvent) => {
      if (event.assignmentId !== id) return
      void fetchAssignment()
    }

    const onAssignmentFailed = (event: AssignmentFailedEvent) => {
      if (event.assignmentId !== id) return
      void fetchAssignment()
      setAssignment((current) => {
        if (!current) return current
        return { ...current, status: event.status }
      })
      if (event.error) {
        console.error(event.error)
      }
      setLoading(false)
    }

    socket.on("assignment:processing", onAssignmentProcessing)
    socket.on("assignment:completed", onAssignmentCompleted)
    socket.on("assignment:failed", onAssignmentFailed)
    socket.on("connect", subscribeToAssignment)

    if (socket.connected) {
      subscribeToAssignment()
    }

    return () => {
      socket.off("assignment:processing", onAssignmentProcessing)
      socket.off("assignment:completed", onAssignmentCompleted)
      socket.off("assignment:failed", onAssignmentFailed)
      socket.off("connect", subscribeToAssignment)
    }
  }, [fetchAssignment, id, socket])

  const handleDownload = async () => {
    if (!assignment?.result) return
    try {
      setDownloading(true)
      const subject = assignment.result.subject || assignment.subject || "assignment"
      await downloadAssignmentPdf(assignment._id, `${subject}-question-paper.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-gray-400" size={32} />
          <p className="text-gray-500 text-sm mt-3">Generating your question paper...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-500 text-lg font-semibold">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-white rounded shadow text-sm font-medium hover:bg-gray-50 text-[#303030]"
          >
            Go Back
          </button>
        </div>
      )
    }

    if (assignment?.status === "pending" || assignment?.status === "processing") {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-orange-500" size={40} />
          <div className="text-lg font-semibold mt-4 text-[#303030]">Your question paper is being generated...</div>
          <div className="text-sm text-gray-500 mt-2">This usually takes 15–30 seconds.</div>
        </div>
      )
    }

    if (assignment?.status === "failed") {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-lg font-semibold text-red-500">Generation Failed</div>
          <div className="text-sm text-gray-500 mt-2">Something went wrong while generating your question paper.</div>
          <button
            onClick={() => router.push("/assignments/new")}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow text-sm font-medium hover:bg-gray-50 text-[#303030]"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      )
    }

    if (assignment?.status === "completed" && assignment.result) {
      return (
        <>
          <div className="bg-[#1a1a1a] text-white rounded-[24px] p-5 flex flex-col gap-4">
            <p className="text-[15px] font-medium leading-relaxed">
              Certainly, John! Here are customized Question Paper for your {(() => {
                const g = assignment.grade || assignment?.result?.grade || "";
                return g.toLowerCase().startsWith("grade") ? g : `Grade ${g}`;
              })()} {assignment.subject || assignment?.result?.subject} classes on the NCERT chapters:
            </p>
            <div className="flex">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex h-[42px] w-10 md:w-auto items-center justify-center gap-2 bg-white text-[#1a1a1a] rounded-full md:px-5 px-0 text-sm font-semibold cursor-pointer hover:bg-gray-100 transition whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
              >
                {downloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> <span className="hidden md:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden md:flex items-center gap-2">
                      <Image src="/download.svg" alt="Download" width={16} height={16} /> Download as PDF
                    </span>
                    <span className="flex md:hidden items-center justify-center">
                      <Download size={18} />
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-white/50 md:bg-white rounded-[32px] mt-6 mb-8 shadow-sm overflow-hidden border border-black/5 md:border-black/5">
            <QuestionPaper assignment={assignment} />
          </div>
        </>
      )
    }

    return null
  }

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden h-screen overflow-hidden bg-[#eeeeee] md:flex">
        <Sidebar activeItem="Assignments" />

        <div className="flex min-w-0 flex-1 flex-col md:ml-[316px]">
          <div className="hidden md:block">
            <TopBar breadcrumb="Assignment" />
          </div>

          <main className="flex-1 overflow-y-auto px-4 pb-10 pt-6 md:px-8">
            <div className="mx-auto w-full max-w-[810px]">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden">
        <div className="min-h-screen bg-[#CECECE] pb-28">
          <MobileTopBar />

          <main className="px-[22px] pb-8 pt-4">
            <div className="mb-5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25"
              >
                <ArrowLeft size={20} className="text-[#303030]" />
              </button>
              <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-[#303030]">
                Assignment
              </h1>
            </div>

            {renderContent()}
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </>
  )
}
