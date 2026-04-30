import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search, ChevronRight } from "lucide-react";
import { useSiem } from "@/lib/siemContext";
import { cn } from "@/lib/utils";

const TITLES: Record<string, { title: string; crumb: string }> = {
  "/": { title: "Security Operations Dashboard", crumb: "Home / Dashboard" },
  "/threat-map": { title: "Global Threat Map", crumb: "Home / Threat Intelligence / Map" },
  "/incidents": { title: "Incident Management", crumb: "Home / Incidents" },
  "/logs": { title: "Log Explorer", crumb: "Home / Investigation / Logs" },
  "/rules": { title: "Correlation Rules", crumb: "Home / Detection / Rules" },
  "/assets": { title: "Asset Inventory", crumb: "Home / Assets" },
  "/reports": { title: "Reports", crumb: "Home / Reports" },
  "/settings": { title: "Settings", crumb: "Home / Settings" },
};

export function Header({ onOpenSearch, onOpenNotifications }: { onOpenSearch: () => void; onOpenNotifications: () => void; }) {
  const loc = useLocation();
  const { notifications } = useSiem();
  const [now, setNow] = useState(new Date());
  const [range, setRange] = useState("24h");

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const meta = TITLES[loc.pathname] || { title: "SENTRY", crumb: "Home" };
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-14 bg-background/85 backdrop-blur border-b border-border flex items-center px-5 gap-5">
      <div className="min-w-[260px]">
        <h1 className="text-sm font-semibold text-foreground">{meta.title}</h1>
        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
          {meta.crumb.split(" / ").map((c, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <span className={i === arr.length - 1 ? "text-primary" : ""}>{c}</span>
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3" />}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onOpenSearch}
        className="flex-1 max-w-[640px] mx-auto flex items-center gap-3 h-9 px-3 bg-surface-2 border border-border hover:border-primary/40 rounded-md text-left transition group"
      >
        <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        <span className="text-xs text-muted-foreground flex-1 font-mono">Search logs, IPs, hostnames, rules…</span>
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-background">Ctrl+K</kbd>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-surface-2 border border-border rounded-md p-0.5">
          {["1h","6h","24h","7d"].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2 h-7 text-[11px] font-mono rounded transition",
                range === r ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="font-mono text-xs text-muted-foreground hidden md:flex items-center gap-2">
          <span className="text-primary glow-text-primary">{now.toLocaleTimeString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" })}</span>
          <span className="text-[10px]">IST</span>
        </div>

        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-md border border-border hover:border-primary/40 bg-surface-2 flex items-center justify-center transition"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-[10px] font-mono text-white flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 px-2.5 h-9 rounded-md border border-success/40 bg-success/10">
          <span className="live-dot" />
          <span className="text-[11px] font-mono font-semibold text-success">LIVE</span>
        </div>
      </div>
    </header>
  );
}
