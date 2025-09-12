import React, { createContext, useContext, useMemo, useState } from "react";

type SidebarState = "expanded" | "collapsed";

interface SidebarContextValue {
  state: SidebarState;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SidebarState>("collapsed");

  const value = useMemo(
    () => ({
      state,
      toggleSidebar: () => setState((s) => (s === "collapsed" ? "expanded" : "collapsed")),
    }),
    [state]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    // Provide a safe fallback so the app doesn't crash if the provider is missing
    return {
      state: "expanded",
      toggleSidebar: () => {},
    };
  }
  return ctx;
}

export function Sidebar(
  {
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
    collapsible?: "icon" | "none";
  }
) {
  return (
    <aside className={`border-r border-gray-200 bg-white ${className}`}>{children}</aside>
  );
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="h-full flex flex-col">{children}</div>;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-2">{children}</div>;
}

export function SidebarGroupLabel(
  { children, className = "" }: { children: React.ReactNode; className?: string }
) {
  return <div className={`px-2 text-xs uppercase tracking-wide ${className}`}>{children}</div>;
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-2">{children}</div>;
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1">{children}</ul>;
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

export function SidebarMenuButton(
  {
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }
) {
  if (asChild) return <>{children}</>;
  return (
    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">
      {children}
    </button>
  );
}


