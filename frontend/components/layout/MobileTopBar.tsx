"use client";

import Image from "next/image";
import { Bell, Menu } from "lucide-react";

export default function MobileTopBar() {
  return (
    <div className="px-2.5 pt-3 md:hidden">
      <div className="flex h-14 items-center justify-between rounded-2xl bg-white px-3">
        <div className="flex items-center">
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
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F6F6]">
            <Bell size={18} className="text-[#303030]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF5623]" />
          </div>
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#ececec]">
            <Image
              src="/avatar_2.jpeg"
              alt="School Profile"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full">
            <Menu size={20} className="text-[#1D1B20]" />
          </button>
        </div>
      </div>
    </div>
  );
}
