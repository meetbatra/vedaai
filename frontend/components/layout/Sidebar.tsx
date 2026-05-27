"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

type SidebarProps = {
  activeItem?: string;
};

const navItems = [
  { label: "Home", icon: "/icons-desktop/home.svg" },
  { label: "My Groups", icon: "/groups.svg" },
  { label: "Assignments", icon: "/assignments.svg" },
  { label: "AI Teacher's Toolkit", icon: "/icons-desktop/toolkit.svg" },
  { label: "My Library", icon: "/icons-desktop/library.svg" },
];

export default function Sidebar({
  activeItem = "Assignments",
}: SidebarProps) {
  const router = useRouter();

  return (
    <aside className="fixed bottom-3 left-3 top-3 hidden w-[304px] flex-col rounded-2xl bg-white px-6 py-7 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] md:flex z-50">
      <div className="mb-9 flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="VedaAI logo"
          width={80}
          height={44}
          className="h-11 w-auto shrink-0"
          priority
        />
        <span className="text-[26px] font-semibold tracking-[-0.03em] text-[#303030]">
          VedaAI
        </span>
      </div>

      {/* Gradient border ring around Create Assignment — from SVG paint3_linear: #FF7950 → #C0350A */}
      <div
        className="mb-8 rounded-full p-[3px]"
        style={{
          background: "linear-gradient(to bottom, #FF7950, #C0350A)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/assignments/new")}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1c1c1e] px-5 text-[15px] font-medium text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <Image src="/icons-desktop/stars.svg" alt="" width={16} height={16} />
          <span>Create Assignment</span>
        </button>
      </div>

      <nav className="flex flex-col gap-1.5">
        {navItems.map(({ label, icon }) => {
          const isActive = label === activeItem;

          return (
            <div
              key={label}
              onClick={() => {
                if (label === "Home") router.push("/");
                if (label === "Assignments") router.push("/assignments");
              }}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-[15px] transition-colors",
                isActive
                  ? "font-medium text-[#303030]"
                  : "text-[#8c8c8c] hover:text-[#303030]",
              ].join(" ")}
            >
              <Image src={icon} alt="" width={16} height={16} />
              <span>{label}</span>
              {label === "My Library" ? (
                <span className="ml-auto rounded-full bg-[#ff5623] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  32
                </span>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex cursor-pointer items-center gap-3 px-4 py-3 text-[15px] text-[#8c8c8c] hover:text-[#303030]">
        <Settings size={16} />
        <span>Settings</span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-[24px] bg-[#f5f5f5] p-3.5">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#ececec]">
          <Image
            src="/avatar_2.jpeg"
            alt="School Profile"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#303030]">
            Delhi Public School
          </p>
          <p className="truncate text-xs text-[#a9a9a9]">Bokaro Steel City</p>
        </div>
      </div>
    </aside>
  );
}
