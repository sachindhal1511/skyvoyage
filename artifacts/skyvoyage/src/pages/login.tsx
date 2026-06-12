import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plane, Cloud, Sun, Wind } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocation("/");
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Left Panel — Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-cyan-500 to-blue-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80')] bg-cover bg-center opacity-25" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Plane className="w-7 h-7" />
              SkyVoyage
            </h1>
            <p className="text-white/70 text-sm mt-1">Your premium travel companion</p>
          </div>
          <div className="space-y-8">
            <blockquote className="text-2xl font-light leading-relaxed">
              "The world is a book, and those who do not travel read only one page."
            </blockquote>
            <p className="text-white/60 text-sm">— Saint Augustine</p>

            {/* Floating Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Cloud, label: "Weather Stations", value: "12K+" },
                { icon: Sun, label: "Destinations", value: "180+" },
                { icon: Wind, label: "Active Travelers", value: "50K+" },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <stat.icon className="w-5 h-5 mb-2 text-white/80" />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-white/40 text-xs">© 2026 SkyVoyage. All rights reserved.</div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold flex items-center justify-center gap-2 text-primary">
              <Plane className="w-6 h-6" /> SkyVoyage
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to continue your journey</p>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-muted/60 hover:bg-muted text-sm font-medium transition-colors" data-testid="btn-google">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-muted/60 hover:bg-muted text-sm font-medium transition-colors" data-testid="btn-github">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" defaultValue="alex@skyvoyage.app" placeholder="name@example.com" className="w-full h-11 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all" data-testid="input-email" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link href="/forgot-password"><span className="text-xs text-primary hover:underline cursor-pointer">Forgot password?</span></Link>
              </div>
              <input type="password" defaultValue="••••••••" placeholder="••••••••" className="w-full h-11 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all" data-testid="input-password" />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold mt-2" data-testid="btn-login">
              Sign In to SkyVoyage
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/signup"><span className="text-primary hover:underline cursor-pointer font-medium">Create one free</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
