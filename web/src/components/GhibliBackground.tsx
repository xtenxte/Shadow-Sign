"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type LeafConfig = {
  leftPercent: number;
  startY: number;
  driftX: number;
  rotateStart: number;
  rotateAmount: number;
  duration: number;
  delay: number;
  fontSize: number;
  targetY: number;
};

const LEAF_COUNT = 20;

export function GhibliBackground() {
  const [leaves, setLeaves] = useState<LeafConfig[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const configs = Array.from({ length: LEAF_COUNT }).map(() => ({
      leftPercent: Math.random() * 100,
      startY: -50,
      driftX: (Math.random() - 0.5) * 200,
      rotateStart: Math.random() * 360,
      rotateAmount: Math.random() * 720,
      duration: 20 + Math.random() * 10,
      delay: Math.random() * 20,
      fontSize: 16 + Math.random() * 16,
      targetY: window.innerHeight + 50,
    }));

    setLeaves(configs);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-light to-sky-dark" />

      {/* Create clouds */}
      <motion.div
        className="absolute top-1/4 left-0 w-[200%] h-32 bg-white/50 rounded-full blur-xl opacity-70"
        animate={{ x: ["-50%", "0%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 right-0 w-[200%] h-40 bg-white/40 rounded-full blur-xl opacity-60"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear", delay: 10 }}
      />

      {/* Create grass */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-grass-dark to-grass-light" />

      {/* Create falling leaves */}
      {leaves.map((leaf, idx) => (
        <motion.div
          key={`leaf-${idx}`}
          className="absolute text-xl text-green-600 opacity-70"
          initial={{
            x: 0,
            y: leaf.startY,
            rotate: leaf.rotateStart,
          }}
          animate={{
            x: leaf.driftX,
            y: leaf.targetY,
            rotate: leaf.rotateStart + leaf.rotateAmount,
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            ease: "linear",
            delay: leaf.delay,
          }}
          style={{
            left: `${leaf.leftPercent}%`,
            fontSize: `${leaf.fontSize}px`,
          }}
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
}
