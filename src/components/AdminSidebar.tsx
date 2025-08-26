import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  Settings,
  Home,
  FileText,
  Bell,
  Shield,
  TrendingUp,
  Database,
  Globe,
  Search,
  Target,
  Lightbulb,
  PenTool,
  Edit
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "ダッシュボード",
    url: "/",
    icon: Home,
    description: "システム概要"
  },
  {
    title: "ドメイン管理",
    url: "/domains",
    icon: Globe,
    description: "ドメイン設定"
  },
  {
    title: "サイト分析",
    url: "/site-analytics",
    icon: BarChart3,
    description: "サイト解析・改善提案"
  },
  {
    title: "競合サイト分析",
    url: "/competitor-analysis",
    icon: Target,
    description: "競合調査"
  },
  {
    title: "コンテンツ提案",
    url: "/content-suggestions",
    icon: PenTool,
    description: "コンテンツ案"
  },
  {
    title: "記事提案・作成",
    url: "/article-creation",
    icon: Edit,
    description: "記事作成"
  }
];

const systemItems = [
  {
    title: "通知設定",
    url: "/notifications",
    icon: Bell,
    description: "通知管理"
  },
  {
    title: "システム設定",
    url: "/settings",
    icon: Settings,
    description: "基本設定"
  }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden group";
    
    if (isActive(path)) {
      return `${baseClasses} bg-gradient-primary text-white shadow-admin-md`;
    }
    
    return `${baseClasses} text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-admin-sm`;
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-border bg-gradient-subtle`}>
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex h-16 items-center border-b border-border px-6">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary mx-auto">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <SidebarContent className="flex-1 p-4">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className={`text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 ${collapsed ? "text-center" : ""}`}>
              {!collapsed ? "メイン機能" : ""}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-white" : "text-sidebar-foreground"}`} />
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span className="leading-tight">{item.title}</span>
                            <span className={`text-xs ${isActive(item.url) ? "text-white/80" : "text-muted-foreground"}`}>
                              {item.description}
                            </span>
                          </div>
                        )}
                        {isActive(item.url) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20 rounded-lg" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* System Settings */}
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className={`text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 ${collapsed ? "text-center" : ""}`}>
              {!collapsed ? "システム" : ""}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {systemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-white" : "text-sidebar-foreground"}`} />
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span className="leading-tight">{item.title}</span>
                            <span className={`text-xs ${isActive(item.url) ? "text-white/80" : "text-muted-foreground"}`}>
                              {item.description}
                            </span>
                          </div>
                        )}
                        {isActive(item.url) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20 rounded-lg" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}