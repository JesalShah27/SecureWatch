import { Severity } from "@/lib/siemData";
import { cn } from "@/lib/utils";

const COLOR: Record<Severity, string> = {
  critical: "bg-sev-critical/15 text-sev-critical border-sev-critical/40",
  high: "bg-sev-high/15 text-sev-high border-sev-high/40",
  medium: "bg-sev-medium/15 text-sev-medium border-sev-medium/40",
  low: "bg-sev-low/15 text-sev-low border-sev-low/40",
  info: "bg-sev-info/15 text-sev-info border-sev-info/40",
};

export function SeverityPill({ severity, className, pulse }: { severity: Severity; className?: string; pulse?: boolean }) {
  return (
    <span className={cn("sev-pill", COLOR[severity], pulse && severity === "critical" && "animate-glow-danger", className)}>
      {severity}
    </span>
  );
}

export function SeverityBar({ severity }: { severity: Severity }) {
  const colors: Record<Severity, string> = {
    critical: "bg-sev-critical",
    high: "bg-sev-high",
    medium: "bg-sev-medium",
    low: "bg-sev-low",
    info: "bg-sev-info",
  };
  return <span className={cn("absolute left-0 top-0 bottom-0 w-1", colors[severity])} />;
}
