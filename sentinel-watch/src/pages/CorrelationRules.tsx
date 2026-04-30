import { useState } from "react";
import { RULES_LIB, RuleDef, relTime } from "@/lib/siemData";
import { SeverityPill } from "@/components/siem/SeverityPill";
import { Plus, Edit, Copy, Trash2, X, ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CorrelationRules() {
  const [rules, setRules] = useState(RULES_LIB);
  const [edit, setEdit] = useState<RuleDef | null>(null);
  const [creating, setCreating] = useState(false);
  const [ruleTemplate, setRuleTemplate] = useState("Custom");

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-muted-foreground">{rules.filter(r=>r.enabled).length} of {rules.length} rules enabled</div>
        </div>
        <button onClick={() => { setCreating(true); setRuleTemplate("Custom"); setEdit({ id:"new", name:"", category:"Authentication", severity:"medium", enabled:true, triggers7d:0, lastTriggered:Date.now(), description:"" }); }}
          className="h-9 px-3 rounded bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Create Rule</button>
      </div>

      <div className="siem-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-surface-2">
            <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {["Rule","Category","Severity","Status","Triggers (7d)","Last Triggered",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} className="border-t border-border hover:bg-surface-2">
                <td className="px-3 py-2.5">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-md">{r.description}</div>
                </td>
                <td className="px-3 text-muted-foreground">{r.category}</td>
                <td className="px-3"><SeverityPill severity={r.severity} /></td>
                <td className="px-3">
                  <button onClick={() => setRules(rs => rs.map(x => x.id===r.id ? {...x, enabled:!x.enabled} : x))}
                    className={cn("relative w-9 h-5 rounded-full transition", r.enabled ? "bg-primary" : "bg-border")}>
                    <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", r.enabled ? "left-[18px]" : "left-0.5")} />
                  </button>
                </td>
                <td className="px-3 font-mono text-primary">{r.triggers7d}</td>
                <td className="px-3 text-[10px] font-mono text-muted-foreground">{relTime(r.lastTriggered)}</td>
                <td className="px-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEdit(r); setCreating(false); }} className="w-7 h-7 rounded border border-border hover:border-primary/40 flex items-center justify-center"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => toast.success("Rule cloned")} className="w-7 h-7 rounded border border-border hover:border-primary/40 flex items-center justify-center"><Copy className="w-3 h-3" /></button>
                    <button onClick={() => { setRules(rs => rs.filter(x => x.id !== r.id)); toast("Rule deleted"); }} className="w-7 h-7 rounded border border-border hover:border-danger/40 hover:text-danger flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <>
          <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm" onClick={() => setEdit(null)} />
          <aside className="fixed right-0 top-0 bottom-0 z-50 w-[680px] bg-card border-l border-border flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-primary">{creating ? "NEW RULE" : edit.id}</div>
                <h2 className="text-base font-semibold">{creating ? "Create Correlation Rule" : "Edit Rule"}</h2>
              </div>
              <button onClick={() => setEdit(null)} className="w-8 h-8 rounded hover:bg-surface-2 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4 text-xs">
              {creating && (
                <Field label="Rule Template">
                  <select value={ruleTemplate} onChange={e => setRuleTemplate(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded font-mono text-[11px] outline-none focus:border-primary/40">
                    <option value="Custom">Custom Rule (Start from scratch)</option>
                    <option value="Threshold">Threshold: Brute Force (High volume in short time)</option>
                    <option value="Sequence">Sequence: Suspicious Login followed by Exfiltration</option>
                    <option value="Behavioral">Behavioral: Impossible Travel Anomaly</option>
                  </select>
                </Field>
              )}

              <Field label="Rule Name"><input defaultValue={edit.name} className="w-full h-9 px-3 bg-background border border-border rounded outline-none focus:border-primary/40" /></Field>
              <Field label="Description"><textarea defaultValue={edit.description} className="w-full h-16 p-2 bg-background border border-border rounded outline-none focus:border-primary/40" /></Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Severity">
                  <select defaultValue={edit.severity} className="w-full h-9 px-2 bg-background border border-border rounded font-mono text-[11px]">
                    {["critical","high","medium","low","info"].map(s => <option key={s} className="bg-card">{s}</option>)}
                  </select>
                </Field>
                <Field label="Category">
                  <select defaultValue={edit.category} className="w-full h-9 px-2 bg-background border border-border rounded font-mono text-[11px]">
                    {["Authentication","Network","Endpoint","Malware","Insider Threat"].map(s => <option key={s} className="bg-card">{s}</option>)}
                  </select>
                </Field>
                <Field label="MITRE ATT&CK">
                  <select className="w-full h-9 px-2 bg-background border border-border rounded font-mono text-[11px] outline-none focus:border-primary/40">
                    <option value="">None</option>
                    <option value="TA0001">TA0001: Initial Access</option>
                    <option value="TA0006">TA0006: Credential Access</option>
                    <option value="TA0008">TA0008: Lateral Movement</option>
                    <option value="TA0011">TA0011: Command and Control</option>
                  </select>
                </Field>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Conditions</div>
                <div className="space-y-2">
                  <ConditionRow first />
                  <div className="flex items-center gap-2">
                    <select className="h-7 px-2 bg-background border border-border rounded font-mono text-[10px]"><option>AND</option><option>OR</option></select>
                  </div>
                  <ConditionRow />
                </div>
                <button className="mt-2 px-3 h-8 rounded border border-dashed border-primary/40 text-primary text-[10px] font-mono">+ Add Condition</button>
              </div>

              <Field label="Threshold">
                <div className="flex items-center gap-2 text-[11px]">
                  <span>Trigger if</span>
                  <input defaultValue={10} className="w-16 h-8 text-center bg-background border border-border rounded font-mono" />
                  <span>events match within</span>
                  <input defaultValue={5} className="w-16 h-8 text-center bg-background border border-border rounded font-mono" />
                  <select className="h-8 px-2 bg-background border border-border rounded"><option>minutes</option><option>seconds</option><option>hours</option></select>
                  <span>from same source</span>
                </div>
              </Field>

              <Field label="Actions on Trigger">
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {["Create Alert","Create Incident","Send Email","Block IP","Run Playbook"].map((a,i) => (
                    <label key={a} className="flex items-center gap-2 p-2 rounded border border-border bg-surface-2 cursor-pointer hover:border-primary/40">
                      <input type="checkbox" defaultChecked={i<2} className="accent-primary" /> {a}
                    </label>
                  ))}
                </div>
              </Field>

              <button onClick={() => toast.success("Tested against last 24h logs", { description: "Matched 47 events" })} className="w-full h-9 rounded bg-primary/15 border border-primary/40 text-primary text-xs flex items-center justify-center gap-2"><Play className="w-3.5 h-3.5" /> Test Rule Against Last 24h Logs</button>
            </div>

            <div className="border-t border-border p-3 flex justify-end gap-2">
              <button onClick={() => setEdit(null)} className="h-9 px-4 rounded border border-border text-xs">Cancel</button>
              <button onClick={() => { toast.success(creating ? "Rule created" : "Rule saved"); setEdit(null); }} className="h-9 px-4 rounded bg-primary text-primary-foreground text-xs font-medium">Save Rule</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function ConditionRow({ first }: { first?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-primary w-8">{first ? "IF" : ""}</span>
      <select className="h-8 px-2 bg-background border border-border rounded font-mono text-[11px] flex-1">
        <option>source_ip</option><option>event_id</option><option>severity</option><option>host</option><option>user</option>
      </select>
      <select className="h-8 px-2 bg-background border border-border rounded font-mono text-[11px]">
        <option>equals</option><option>contains</option><option>greater than</option><option>regex</option>
      </select>
      <input placeholder="value" className="h-8 px-2 bg-background border border-border rounded font-mono text-[11px] flex-1 outline-none focus:border-primary/40" />
    </div>
  );
}
