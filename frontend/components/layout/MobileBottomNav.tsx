"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", icon: "/mobile_home.svg", href: "/" },
  { label: "Assignments", icon: "/mobile_assignments.svg", href: "/assignments" },
  { label: "Library", icon: "/mobile_library.svg", href: "/library" },
  { label: "AI Toolkit", icon: "/mobile_toolkit.svg", href: "/toolkit" },
];

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="pointer-events-none fixed bottom-2 left-0 right-0 z-50 px-2.5 md:hidden">
      <div className="pointer-events-auto h-[72px] rounded-[24px] bg-[#181818] px-4 shadow-[0_16px_24px_rgba(0,0,0,0.12),0_32px_24px_rgba(0,0,0,0.2)]">
        <div className="flex h-full items-center justify-between">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.href === "/" || item.href === "/assignments") {
                  router.push(item.href);
                }
              }}
              className="flex flex-col items-center gap-1"
            >
              <Image 
                src={item.icon} 
                alt={item.label} 
                width={item.label === "Assignments" ? 22 : 20} 
                height={item.label === "Assignments" ? 22 : 20} 
                className={isActive(item.href) ? "opacity-100" : "opacity-40"}
                unoptimized 
              />
              <span className={`text-[10px] ${isActive(item.href) ? "text-white" : "text-white/40"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
