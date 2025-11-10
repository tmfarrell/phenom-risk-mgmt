import { NavLink, useLocation } from "react-router-dom"
import { Users, ChevronLeft, Fingerprint, Upload, CodeXml, BarChart3, Map } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"

const dataSection = [
  {
    title: "Origin",
    url: "/origin",
    icon: Upload,
  },
  {
    title: "PhenOM API",
    url: "/api-docs",
    icon: CodeXml,
  }
]

const aiMlSection = [
  {
    title: "PhenOM Catalog",
    url: "/phenom-builder",
    icon: Fingerprint,
  }
]

const applicationsSection = [
  {
    title: "Patient Risk Panel",
    url: "/",
    icon: Users,
  },
  {
    title: "Population Risk Panel",
    url: "/population",
    icon: BarChart3,
  },
  {
    title: "Regional Risk Panel",
    url: "/regional",
    icon: Map,
  }
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path === "/phenom-builder" && currentPath.startsWith("/phenom-builder")) return true;
    if (path === "/population" && currentPath.startsWith("/population")) return true;
    if (path === "/regional" && currentPath.startsWith("/regional")) return true;
    if (path === "/origin" && currentPath.startsWith("/origin")) return true;
    if (path === "/api-docs" && currentPath.startsWith("/api-docs")) return true;
    return currentPath === path;
  }
  
  const allItems = [...dataSection, ...aiMlSection, ...applicationsSection]
  const isExpanded = allItems.some((app) => isActive(app.url))
  const isCollapsed = state === "collapsed"

  const getNavClass = (active: boolean) =>
    active 
      ? "bg-blue-100 text-blue-900 font-medium hover:bg-blue-200" 
      : "hover:bg-gray-100 text-gray-700"

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-52"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Toggle Button */}
        <div className="flex justify-end p-2">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft 
              className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>

        {/* Data Section */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-gray-400 font-semibold text-left">
              Data
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {dataSection.map((app) => (
                <SidebarMenuItem key={app.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={app.url} 
                      className={`${getNavClass(isActive(app.url))} flex items-center gap-3 px-3 py-2 rounded text-sm text-left`}
                    >
                      <app.icon className="mr-1.5 h-5 w-5 shrink-0" />
                      {!isCollapsed && <span className="font-medium leading-none">{app.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI/ML Section */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-gray-400 font-semibold text-left pt-3">
              AI/ ML
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {aiMlSection.map((app) => (
                <SidebarMenuItem key={app.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={app.url} 
                      className={`${getNavClass(isActive(app.url))} flex items-center gap-3 px-3 py-2 rounded text-sm text-left`}
                    >
                      <app.icon className="mr-1.5 h-5 w-5 shrink-0" />
                      {!isCollapsed && <span className="font-medium leading-none">{app.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Applications Section */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-gray-400 font-semibold text-left pt-3">
              Applications
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {applicationsSection.map((app) => (
                <SidebarMenuItem key={app.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={app.url} 
                      className={`${getNavClass(isActive(app.url))} flex items-center gap-3 px-3 py-2 rounded text-sm text-left`}
                    >
                      <app.icon className="mr-1.5 h-5 w-5 shrink-0" />
                      {!isCollapsed && <span className="font-medium leading-none">{app.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}