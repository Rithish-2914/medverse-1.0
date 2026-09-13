"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface RoundState {
  currentRoundIdx: number;
  status: string;
  roundName: string;
  totalRounds: number;
  revealedTwist: string | null;
}

const TRACKS = [
  { id: "A", label: "Track A", sub: "AI & Digital Health", desc: "CSE / IT / AI-DS", color: "from-cyan-500/20 to-blue-600/20", border: "border-cyan-500/30", glow: "shadow-cyan-500/20", dot: "bg-cyan-400" },
  { id: "B", label: "Track B", sub: "Medical Devices", desc: "ECE / Mech / Biomedical", color: "from-violet-500/20 to-purple-600/20", border: "border-violet-500/30", glow: "shadow-violet-500/20", dot: "bg-violet-400" },
  { id: "C", label: "Track C", sub: "Healthcare Delivery", desc: "Medicine / Pharmacy / Nursing", color: "from-emerald-500/20 to-teal-600/20", border: "border-emerald-500/30", glow: "shadow-emerald-500/20", dot: "bg-emerald-400" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400",
  ended: "text-red-400",
  not_started: "text-amber-400",
};

export default function Home() {
  const [state, setState] = useState<RoundState | null>(null);

  useEffect(() => {
    fetch("/api/public/state").then(r => r.json()).then(setState).catch(() => {});
    const interval = setInterval(() => {
      fetch("/api/public/state").then(r => r.json()).then(setState).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#060612] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-600/8 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-sm font-black">M</div>
          <span className="font-bold text-lg tracking-tight">MEDVERSE</span>
        </div>
        <div className="flex gap-3">
          <Link href="/register" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-all border border-white/10 hover:border-cyan-500/40">Register Team</Link>
          <Link href="/participant" className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium transition-all border border-cyan-500/20 hover:border-cyan-500/50">Team Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Medical Technology Hackathon
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-gradient-to-br from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent leading-none pb-2">
          MEDVERSE
        </h1>
        <p className="text-xl md:text-2xl font-light text-slate-400 mb-2 max-w-2xl">
          Operation 9 Hours
        </p>
        <p className="text-base text-slate-500 max-w-xl mb-12">
          Three tracks. Real patients. Sealed kits. One day to build something that matters.
        </p>

        {/* Live round status */}
        <div className="mb-12 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-full max-w-md">
          {state ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Current Round</span>
                <span className={`font-semibold ${STATUS_COLORS[state.status] ?? "text-slate-300"}`}>
                  {state.status === "active" ? "LIVE" : state.status === "ended" ? "ENDED" : "STANDBY"}
                </span>
              </div>
              <p className="text-lg font-bold text-white">{state.roundName}</p>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: state.totalRounds }).map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < state.currentRoundIdx ? "bg-cyan-500" : i === state.currentRoundIdx ? (state.status === "active" ? "bg-cyan-400 animate-pulse" : "bg-amber-400") : "bg-white/10"}`} />
                ))}
              </div>
              {state.revealedTwist && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <span className="font-bold">TWIST: </span>{state.revealedTwist}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-3 h-3 rounded-full border border-slate-600 border-t-slate-300 animate-spin" />
              Connecting to event...
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-base hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
            Register Your Team
          </Link>
          <Link href="/participant" className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white font-semibold text-base hover:bg-white/10 transition-all hover:-translate-y-0.5 active:translate-y-0">
            Team Portal
          </Link>
        </div>
      </section>

      {/* Tracks */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-center text-2xl font-bold text-white mb-2">Three Tracks</h2>
        <p className="text-center text-slate-500 text-sm mb-10">Every team gets a sealed patient scenario and a random constraint. Your job is to solve it.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {TRACKS.map(t => (
            <div key={t.id} className={`relative rounded-2xl p-6 bg-gradient-to-br ${t.color} border ${t.border} shadow-xl ${t.glow} transition-all hover:-translate-y-1 hover:shadow-2xl`}>
              <div className={`w-8 h-8 rounded-lg ${t.dot} mb-4 flex items-center justify-center text-black font-black text-sm`}>{t.id}</div>
              <h3 className="text-lg font-bold text-white mb-1">{t.sub}</h3>
              <p className="text-xs text-slate-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Admin / Judge footer links */}
      <div className="relative z-10 text-center pb-10 flex justify-center gap-6 text-xs text-slate-600">
        <Link href="/admin" className="hover:text-slate-400 transition-colors">Organiser Panel</Link>
        <span>·</span>
        <Link href="/judge" className="hover:text-slate-400 transition-colors">Judge Panel</Link>
      </div>
    </main>
  );
}