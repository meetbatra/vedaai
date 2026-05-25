"use client";

import Image from "next/image";
import { ArrowLeft, ChevronDown } from "lucide-react";

type TopBarProps = {
  breadcrumb?: string;
};

export default function TopBar({ breadcrumb = "Assignment" }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5]">
      <header className="flex h-16 w-full items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <ArrowLeft size={20} className="cursor-pointer text-[#303030] hover:opacity-75 transition-opacity" />
          <span className="text-base font-semibold text-[#8c8c8c]">{breadcrumb}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <Image src="/bell.svg" alt="Notifications" width={18} height={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff5623]" />
          </button>
          
          <div className="flex items-center gap-3 rounded-full bg-transparent px-1 cursor-pointer">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-300">
              <Image
                src="/avatar_2.jpeg"
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-sm font-semibold text-[#303030]">John Doe</span>
            <ChevronDown size={16} className="text-[#303030]" />
          </div>
        </div>
      </header>
    </div>
  );
}
