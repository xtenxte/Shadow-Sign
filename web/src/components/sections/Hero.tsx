"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { WalletConnectButton } from "@/components/ui/WalletConnectButton";

type HeroProps = {
  onStart: () => void;
};

export function Hero({ onStart }: HeroProps) {
  const { isConnected } = useAccount();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#080713]/90 via-[#0a011f]/70 to-[#05030e]/90 px-6 py-12 shadow-[0_30px_160px_rgba(96,51,255,0.55)] sm:px-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full blur-[140px] bg-purple-600/40" />
        <div className="absolute top-12 -right-24 h-64 w-64 rounded-full blur-[160px] bg-cyan-500/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      </div>
      <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.6em] text-indigo-200/80">
            Shadow Sign · Encrypted Arena
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            Man vs Machine under a{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
              neon FHE sky
            </span>
          </motion.h1>
          <p className="max-w-2xl text-base text-slate-200/90 sm:text-lg">
            Every stance, score, and clash is executed on Zama&apos;s FHEVM. No
            validator, spectator, or machine entity can peek at the moves until
            <strong> you</strong> authorize the reveal.
          </p>
          <ul className="space-y-3 text-sm text-slate-200/90">
            {[
              "Encrypted rock-paper-scissors with on-chain randomness",
              "Best-of-three duels streamed as neon telemetry",
              "Instant status on wallet, chain, and FHE readiness",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-slate-100/90"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 rounded-full border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-600/80 via-purple-600/80 to-cyan-500/80 px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_60px_rgba(138,92,246,0.45)] transition hover:translate-y-0.5 hover:brightness-110"
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
              {isConnected ? "Start encrypted duel" : "Preview the arena"}
            </button>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono uppercase tracking-[0.4em] text-slate-100/80">
              Sepolia · FHEVM
            </div>
            <WalletConnectButton />
          </div>
        </div>
        <div className="relative mx-auto flex h-[360px] w-full max-w-[360px] items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 via-fuchsia-300/30 to-cyan-200/30 blur-[80px]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            className="absolute h-72 w-72 rounded-full border border-white/15"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
            className="absolute h-60 w-60 rounded-full border border-cyan-200/20"
          />
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative grid h-48 w-48 place-items-center rounded-[38%] bg-black/30 shadow-[0_0_40px_rgba(129,140,248,0.45)] backdrop-blur-xl"
          >
            <div className="absolute inset-0 rounded-[38%] border border-white/10" />
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.5em] text-slate-200/80">
                neural core
              </p>
              <p className="text-3xl font-semibold text-white">Ξ</p>
              <p className="text-xs text-slate-300/80">FHE executor</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

