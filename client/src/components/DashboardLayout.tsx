import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Sparkles,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Users, label: "Lead composer", path: "/lead-composer" },
  { icon: Sparkles, label: "Creative Studio", path: "/creative-studio" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex w-full max-w-md flex-col items-center gap-8 p-8">
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              DSAI / Workdesk
            </p>
            <h1 className="text-center text-2xl font-semibold tracking-tight">
              Sign in to continue
            </h1>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button onClick={() => startLogin()} size="lg" className="w-full shadow-lg">
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const activeMenuItem = menuItems.find((item) => location === item.path);

  const navigate = (path: string) => {
    setLocation(path);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r-0 [&_[data-slot=sidebar-gap]]:transition-[width] [&_[data-slot=sidebar-gap]]:duration-200 [&_[data-slot=sidebar-gap]]:ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        <SidebarHeader className="h-16 justify-center border-b border-sidebar-border/60 px-2">
          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? "Expand navigation" : "Collapse navigation"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-[background-color,color,transform] duration-150 ease-out hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <PanelLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="min-w-0 overflow-hidden transition-[opacity,transform] duration-200 ease-out group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-translate-x-2 group-data-[collapsible=icon]:opacity-0">
              <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">DSAI Workdesk</p>
              <p className="truncate text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">Control surface</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 py-3">
          <p className="px-4 pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/45 group-data-[collapsible=icon]:sr-only">
            Navigate
          </p>
          <SidebarMenu className="px-2">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => navigate(item.path)}
                    tooltip={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className="h-10 font-normal transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98]"
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open account menu"
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-sidebar-accent active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center"
              >
                <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border">
                  <AvatarFallback className="bg-sidebar-accent text-xs font-medium text-sidebar-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "D"}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="block truncate text-sm font-medium text-sidebar-foreground">{user?.name || "DSAI user"}</span>
                  <span className="mt-0.5 block truncate text-xs text-sidebar-foreground/55">{user?.email || "Account"}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {isMobile && (
          <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <SidebarTrigger
              aria-label="Open navigation"
              className="h-9 w-9 rounded-lg transition-transform duration-150 active:scale-[0.97]"
            />
            <span className="truncate text-sm font-medium text-foreground">
              {activeMenuItem?.label ?? "DSAI Workdesk"}
            </span>
          </header>
        )}
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
