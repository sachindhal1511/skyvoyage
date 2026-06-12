import { Link, useLocation } from "wouter";
import { LayoutDashboard, CloudRain, Map, CalendarDays, ListTree, Briefcase, BarChart2, Bookmark, Settings, LogOut, Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/weather", label: "Weather", icon: CloudRain },
    { href: "/destinations", label: "Destinations", icon: Map },
    { href: "/planner", label: "Trip Planner", icon: CalendarDays },
    { href: "/itinerary", label: "Itinerary", icon: ListTree },
    { href: "/packing", label: "Packing", icon: Briefcase },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-display font-bold tracking-tight text-primary">SkyVoyage</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-1">
        <Link href="/settings">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${location === '/settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </div>
        </Link>
        <Link href="/login">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search destinations, trips, or weather..." 
            className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>SV</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
