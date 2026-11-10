"use client";

import { SessionProvider } from "next-auth/react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LeftSidebar } from "@/components/leftSidebar";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  let path = usePathname();
  const [showSIdebar, setShowSIdebar] = useState(false);
  
  useEffect(() => {
    if (path === "/" || path === '/sign-in' || path === '/signup') {
      setShowSIdebar(false);
    } else {
      setShowSIdebar(true);
    }
  }, [path]);

  return (
    <SessionProvider>
      <SidebarProvider>
        {showSIdebar && <LeftSidebar />}
        {/* <LeftSidebar/> */}
        <SidebarInset className="min-w-0 bg-zinc-950">
          {showSIdebar && (
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur">
              <SidebarTrigger className="-ml-1 text-zinc-400 hover:bg-zinc-800 hover:text-white" />
              <Separator orientation="vertical" className="h-4 bg-zinc-800" />
            </header>
          )}
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
