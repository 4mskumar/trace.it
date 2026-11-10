"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Profile", href: "/profile", icon: User },
];

export const LeftSidebar = () => {
  
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isMobile } = useSidebar();

  const user = session?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <Sidebar
      collapsible="icon"
      className={`border-r border-zinc-800 w-[15%] [&_[data-sidebar=sidebar]]:bg-zinc-950 [&_[data-sidebar=sidebar]]:text-zinc-300 }`}
    >
      {/* Brand */}
      <SidebarHeader className="h-14 w-[115%] justify-center border-b border-zinc-800">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* This shadcn build uses Base UI: `render` replaces `asChild` */}
            <SidebarMenuButton
              size="lg"
              tooltip="CodeLens"
              render={<Link href="/" />}
              className="hover:bg-zinc-900 hover:text-white"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-sm font-bold text-white hover:text-emerald-400 duration-150 hover:scale-110 transition-all">
                T
              </div>
              {/* <Image src={'/images/white logo.png'} height={300} className="w-[25%]" width={1000} alt="trace logo" /> */}
              <h1 className="text-2xl tracking-tight">
                <span className="font-bold">
                  trace
                  </span>
                .it</h1>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-zinc-500">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="flex-row items-center gap-3 text-zinc-400 hover:bg-zinc-800/70 hover:text-white data-[active=true]:bg-emerald-900/40 data-[active=true]:font-medium data-[active=true]:text-emerald-300"
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User / auth */}
      <SidebarFooter className="border-t border-zinc-800">
        <SidebarMenu>
          <SidebarMenuItem>
            {status === "loading" ? (
              <div className="h-12 animate-pulse rounded-md bg-zinc-800/60" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      tooltip={user.name ?? "Account"}
                      className="hover:bg-zinc-800/70 data-[popup-open]:bg-zinc-800"
                    />
                  }
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? ""}
                    />
                    <AvatarFallback className="rounded-lg bg-emerald-900 text-emerald-300">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium text-white">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-zinc-500">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-zinc-500 group-data-[collapsible=icon]:hidden" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={8}
                  className="w-56 border-zinc-800 bg-zinc-900 text-zinc-200"
                >
                  {/* Base UI requires labels to live inside a Group */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <p className="truncate text-sm font-medium text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer text-red-400 focus:bg-red-900/40 focus:text-red-300"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton
                tooltip="Sign in"
                onClick={() => signIn()}
                className="text-zinc-400 hover:bg-emerald-900/40 hover:text-emerald-300"
              >
                <LogIn className="size-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Sign in
                </span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};