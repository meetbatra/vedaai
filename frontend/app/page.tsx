import Sidebar from "@/components/layout/Sidebar";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import MobileTopBar from "@/components/layout/MobileTopBar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function Home() {
  const desktopContent = (
    <div className="hidden h-screen overflow-hidden bg-[#f6f6f6] font-sans md:flex">
      <Sidebar activeItem="Home" />
      
      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col md:ml-[327px] md:mr-[13px]">
        <div className="hidden md:block">
          <TopBar breadcrumb="Home" />
        </div>
        
        <main className="flex-1 overflow-y-auto pt-6">
          <>
            {/* Header matching Assignment page style */}
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff5623]" />
              <h1 className="text-[44px] font-semibold tracking-[-0.03em] text-[#303030]">
                Welcome to VedaAI
              </h1>
            </div>
            <p className="mb-10 ml-4 text-[15px] text-[#a9a9a9]">
              The intelligent academic assessment platform for modern institutions.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Feature Card 1 */}
              <div className="bg-white p-6 rounded-2xl border border-black/[0.08] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.02)] flex flex-col items-start">
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center mb-5">
                  <Image src="/assignments.svg" alt="Assignments" width={20} height={20} className="opacity-70" />
                </div>
                <h3 className="text-lg font-semibold text-[#303030] mb-2">Smart Assignments</h3>
                <p className="text-[#6f6f6f] text-sm leading-relaxed mb-4 flex-1">
                  Generate tailored assignments instantly. Craft intelligent question papers ranging from MCQs to detailed essay prompts.
                </p>
                <a href="/assignments/new" className="text-[#ff5623] text-sm font-semibold hover:underline">Create an assignment &rarr;</a>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white p-6 rounded-2xl border border-black/[0.08] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.02)] flex flex-col items-start">
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center mb-5">
                  <Image src="/groups.svg" alt="Analytics" width={20} height={20} className="opacity-70" />
                </div>
                <h3 className="text-lg font-semibold text-[#303030] mb-2">Actionable Analytics</h3>
                <p className="text-[#6f6f6f] text-sm leading-relaxed mb-4 flex-1">
                  Track student progress over time. Identify learning gaps and strengths with comprehensive, data-driven dashboards.
                </p>
                <span className="text-[#a9a9a9] text-sm font-semibold cursor-not-allowed">Coming soon</span>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white p-6 rounded-2xl border border-black/[0.08] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.02)] flex flex-col items-start md:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center mb-5">
                  <Image src="/icons-desktop/toolkit.svg" alt="Feedback" width={20} height={20} className="opacity-70" />
                </div>
                <h3 className="text-lg font-semibold text-[#303030] mb-2">Automated Grading</h3>
                <p className="text-[#6f6f6f] text-sm leading-relaxed max-w-2xl">
                  Reclaim thousands of hours. AI-powered evaluation provides instant, objective grading along with personalized, constructive feedback for every student.
                </p>
              </div>
            </div>

          </>
        </main>
      </div>
    </div>
  );

  const mobileContent = (
    <div className="flex min-h-screen flex-col bg-[#CECECE] pb-28 md:hidden font-sans">
      <MobileTopBar />

      <main className="flex-1 px-[14px] pt-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#ff5623]" />
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#303030]">
            Welcome
          </h1>
        </div>
        <p className="mb-6 ml-3 text-[13px] text-[#6f6f6f]">
          The intelligent academic assessment platform.
        </p>

        <div className="flex flex-col gap-3">
          {/* Feature Card 1 */}
          <div className="bg-white/70 p-5 rounded-2xl border border-black/[0.08] flex flex-col items-start">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm border border-black/[0.04]">
              <Image src="/assignments.svg" alt="Assignments" width={16} height={16} className="opacity-70" />
            </div>
            <h3 className="text-base font-semibold text-[#303030] mb-1">Smart Assignments</h3>
            <p className="text-[#6f6f6f] text-[13px] leading-relaxed mb-3">
              Generate tailored assignments instantly with AI.
            </p>
            <a href="/assignments/new" className="text-[#ff5623] text-[13px] font-semibold hover:underline">Create assignment &rarr;</a>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white/70 p-5 rounded-2xl border border-black/[0.08] flex flex-col items-start">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm border border-black/[0.04]">
              <Image src="/groups.svg" alt="Analytics" width={16} height={16} className="opacity-70" />
            </div>
            <h3 className="text-base font-semibold text-[#303030] mb-1">Actionable Analytics</h3>
            <p className="text-[#6f6f6f] text-[13px] leading-relaxed mb-3">
              Track student progress over time. Identify learning gaps.
            </p>
            <span className="text-[#a9a9a9] text-[13px] font-semibold cursor-not-allowed">Coming soon</span>
          </div>
        </div>
      </main>

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
