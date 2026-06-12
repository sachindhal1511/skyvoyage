import { useState } from "react";
import { User, Bell, Globe, Lock, Palette, Thermometer, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Settings() {
  const [unit, setUnit] = useState<"celsius" | "fahrenheit">("celsius");
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [notifWeather, setNotifWeather] = useState(true);
  const [notifTrips, setNotifTrips] = useState(true);
  const [notifSeasonal, setNotifSeasonal] = useState(false);
  const [profile, setProfile] = useState({ name: "Alex Traveler", email: "alex@skyvoyage.app", bio: "Adventure seeker exploring the world one destination at a time." });

  function toggleDark(enabled: boolean) {
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
    toast.success(`${enabled ? "Dark" : "Light"} mode enabled`);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Profile saved successfully");
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "units", label: "Units & Language", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Lock },
  ];

  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your SkyVoyage experience</p>
      </div>

      <div className="flex gap-6">
        {/* Settings Sidebar */}
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-1 sticky top-6">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeSection === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                data-testid={`settings-nav-${s.id}`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 glass-card rounded-2xl p-6 space-y-6">
          {/* Profile */}
          {activeSection === "profile" && (
            <div>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><User className="w-5 h-5 text-primary" />Profile</h2>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <button className="text-xs text-primary hover:underline mt-1">Change photo</button>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Full Name</label>
                    <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Email</label>
                    <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-email" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Bio</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} className="w-full h-20 px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm resize-none" data-testid="input-bio" />
                </div>
                <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity" data-testid="save-profile-btn">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <div>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><Palette className="w-5 h-5 text-primary" />Appearance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <p className="font-medium text-sm">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={toggleDark} data-testid="dark-mode-toggle" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{ label: "Light", active: !darkMode }, { label: "Dark", active: darkMode }].map(theme => (
                    <button key={theme.label} onClick={() => toggleDark(theme.label === "Dark")} className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${theme.active ? "border-primary bg-primary/10" : "border-border bg-muted/40 hover:bg-muted"}`} data-testid={`theme-${theme.label.toLowerCase()}`}>
                      {theme.label} Mode
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Units & Language */}
          {activeSection === "units" && (
            <div>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Units & Language</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium block mb-2 flex items-center gap-2"><Thermometer className="w-4 h-4" />Temperature Unit</label>
                  <div className="flex gap-3">
                    {["celsius", "fahrenheit"].map(u => (
                      <button key={u} onClick={() => { setUnit(u as "celsius" | "fahrenheit"); toast.success(`Switched to °${u === "celsius" ? "C" : "F"}`); }} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${unit === u ? "border-primary bg-primary/10" : "border-border bg-muted/40 hover:bg-muted"}`} data-testid={`unit-${u}`}>
                        {u === "celsius" ? "Celsius (°C)" : "Fahrenheit (°F)"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger data-testid="language-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><Bell className="w-5 h-5 text-primary" />Notifications</h2>
              <div className="space-y-3">
                {[
                  { label: "Weather Alerts", desc: "Get notified about severe weather at your destinations", value: notifWeather, onChange: setNotifWeather, id: "notif-weather" },
                  { label: "Trip Reminders", desc: "Reminders before your upcoming trips", value: notifTrips, onChange: setNotifTrips, id: "notif-trips" },
                  { label: "Seasonal Suggestions", desc: "Best time to visit recommendations", value: notifSeasonal, onChange: setNotifSeasonal, id: "notif-seasonal" },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.onChange} data-testid={item.id} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeSection === "privacy" && (
            <div>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" />Privacy & Security</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/40 space-y-1">
                  <p className="font-medium text-sm">Data Usage</p>
                  <p className="text-xs text-muted-foreground">Your travel data is stored locally and never shared with third parties without your consent.</p>
                </div>
                <button className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors" data-testid="export-data-btn">
                  Export My Data
                </button>
                <button className="w-full py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors" data-testid="delete-account-btn">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
