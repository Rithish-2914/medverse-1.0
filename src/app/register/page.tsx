"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TRACKS = [
  { id: "A", label: "AI & Digital Health", desc: "Build AI/ML tools, apps, or data systems for healthcare. For CSE, IT, AI-DS students.", color: "border-cyan-500/40 bg-cyan-500/10", active: "border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-500/30" },
  { id: "B", label: "Medical Devices & Hardware", desc: "Design physical diagnostic or assistive devices. For ECE, Mechanical, Biomedical students.", color: "border-violet-500/40 bg-violet-500/10", active: "border-violet-400 bg-violet-500/20 ring-2 ring-violet-500/30" },
  { id: "C", label: "Healthcare Delivery", desc: "Design community and public health solutions. For Medicine, Pharmacy, Nursing students.", color: "border-emerald-500/40 bg-emerald-500/10", active: "border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-500/30" },
];

interface Member { name: string; regNo: string; }

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [track, setTrack] = useState("");
  const [teamName, setTeamName] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [college, setCollege] = useState("");
  const [size, setSize] = useState(1);
  const [password, setPassword] = useState("");
  const [members, setMembers] = useState<Member[]>([{ name: "", regNo: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateSize(n: number) {
    setSize(n);
    setMembers(prev => {
      const next = [...prev];
      while (next.length < n) next.push({ name: "", regNo: "" });
      return next.slice(0, n);
    });
  }

  function updateMember(i: number, field: "name" | "regNo", val: string) {
    setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName, track, leadName, leadEmail, college, size, password, members }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      router.push("/participant");
    } catch {
      setError("Network error — try again");
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all text-sm";
  const labelCls = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <main className="min-h-screen bg-[#060612] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-violet-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <Link href="/" className="flex items-center gap-2 mb-8 text-slate-400 hover:text-white transition-colors text-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-1">Register Your Team</h1>
          <p className="text-slate-400 text-sm">Step {step} of 2 — {step === 1 ? "Team details" : "Team members"}</p>
          <div className="flex gap-1 mt-3">
            <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? "bg-cyan-500" : "bg-white/10"}`} />
            <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? "bg-cyan-500" : "bg-white/10"}`} />
          </div>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 backdrop-blur-md">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Track *</label>
                <div className="space-y-2">
                  {TRACKS.map(t => (
                    <button key={t.id} onClick={() => setTrack(t.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${track === t.id ? t.active : t.color + " hover:brightness-110"}`}>
                      <div className="font-semibold text-sm text-white">Track {t.id} — {t.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Team Name *</label>
                <input className={inputCls} placeholder="e.g. Neural Healers" value={teamName} onChange={e => setTeamName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Team Size *</label>
                  <select className={inputCls} value={size} onChange={e => updateSize(Number(e.target.value))}>
                    <option value={1}>1 member (solo)</option>
                    <option value={2}>2 members</option>
                    <option value={3}>3 members</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>College</label>
                  <input className={inputCls} placeholder="Your college" value={college} onChange={e => setCollege(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Lead Name *</label>
                <input className={inputCls} placeholder="Team leader full name" value={leadName} onChange={e => setLeadName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Lead Email</label>
                <input className={inputCls} type="email" placeholder="leader@email.com" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Team Password *</label>
                <input className={inputCls} type="password" placeholder="8+ characters" value={password} onChange={e => setPassword(e.target.value)} />
                <p className="text-xs text-slate-500 mt-1">All team members use this to log in</p>
              </div>
              <button
                onClick={() => { if (!track) { setError("Select a track"); return; } if (!teamName.trim() || !leadName.trim() || password.length < 8) { setError("Fill all required fields (password min 8 chars)"); return; } setError(""); setStep(2); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Next — Add Members
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-slate-400">Add details for all {size} team member{size > 1 ? "s" : ""}. Each registration number must be unique.</p>
              {members.map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{i === 0 ? "Team Lead" : `Member ${i + 1}`}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input className={inputCls} placeholder="Full name" value={m.name} onChange={e => updateMember(i, "name", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Reg. Number *</label>
                      <input className={inputCls} placeholder="e.g. 22BCE1234" value={m.regNo} onChange={e => updateMember(i, "regNo", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <button onClick={() => { setStep(1); setError(""); }} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all">Back</button>
                <button onClick={submit} disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                  {loading ? "Registering..." : "Register Team"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Already registered?{" "}
          <Link href="/participant" className="text-cyan-400 hover:underline">Go to team portal</Link>
        </p>
      </div>
    </main>
  );
}