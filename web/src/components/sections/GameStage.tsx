"use client";

import type { CSSProperties } from "react";
import { useAccount, useChainId } from "wagmi";
import { motion } from "framer-motion";
import clsx from "clsx";
import { REQUIRED_CHAIN_ID } from "@/lib/constants";
import { MoveChoice, useShadowSignGame } from "@/hooks/useShadowSignGame";

const moveEmojis = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

const moveNames = ["Rock", "Paper", "Scissors"];

export function GameStage() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const {
    snapshot,
    playRound,
    resetSeries,
    isBusy,
    fheStatus,
  } = useShadowSignGame();

  const isSeriesOver = snapshot.seriesOver;
  const baseReady =
    isConnected && chainId === REQUIRED_CHAIN_ID && fheStatus === "ready";
  const canPlayMove = baseReady && !isBusy && !isSeriesOver;
  const canResetGame = baseReady && !isBusy;

  const handleMove = async (choice: MoveChoice) => {
    await playRound(choice);
  };

  const getResultText = (result: number) => {
    if (result === 1) return "You Won ✨";
    if (result === 2) return "Machine Won";
    return "Draw";
  };

  const compactCardStyle = {
    padding: "5px",
    borderWidth: "1px",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
  };

  const scoreRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "3px 6px",
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 pb-10">
      {/* Three Column Layout - Always horizontal */}
      <div
        className="grid gap-1.5 items-stretch min-h-[230px]"
        style={{ gridTemplateColumns: "1.05fr 1.3fr 1.05fr" }}
      >
        
        {/* Left: Score */}
        <div className="ghibli-card flex flex-col" style={compactCardStyle}>
          <h3 className="handwritten text-center text-gray-800 mb-1.5" style={{ fontSize: '1.85rem', letterSpacing: '0.08em' }}>
            Score
          </h3>
          
          <div className="flex-1 flex flex-col justify-center gap-1">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-50 rounded-md shadow-sm" style={{ padding: "1px" }}>
              <div style={scoreRowStyle}>
                <p className="text-gray-600 uppercase" style={{ fontSize: '0.95rem', letterSpacing: '0.12em' }}>YOU</p>
                <p className="font-black text-gray-800" style={{ fontSize: '3.6rem', lineHeight: 1, textShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
                  {snapshot.score.player}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-100 to-rose-50 rounded-md shadow-sm" style={{ padding: "1px" }}>
              <div style={scoreRowStyle}>
                <p className="text-gray-600 uppercase" style={{ fontSize: '0.95rem', letterSpacing: '0.12em' }}>MACHINE</p>
                <p className="font-black text-gray-800" style={{ fontSize: '3.6rem', lineHeight: 1, textShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
                  {snapshot.score.machine}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={resetSeries}
            disabled={!canResetGame}
            className="ghibli-button w-full mt-1"
            style={{ fontSize: '0.95rem', padding: '0.3rem 0.6rem', borderRadius: '14px' }}
          >
            Reset Game
          </button>
        </div>

        {/* Center: Move Choices */}
        <div
          className="ghibli-card flex flex-col justify-center items-center relative overflow-hidden"
          style={compactCardStyle}
        >
          {snapshot.victor && (
            <div
              className="mb-2 text-center font-semibold uppercase tracking-wide drop-shadow-lg"
              style={{
                fontSize: "1.35rem",
                color: snapshot.victor === "player" ? "#0c7047" : "#0c7047",
              }}
            >
              {snapshot.victor === "player"
                ? "🎉 YOU WON THE SERIES — RESET TO DUEL AGAIN"
                : "MACHINE PREVAILED — TAP RESET GAME TO CHALLENGE AGAIN"}
            </div>
          )}

          <h3 className="handwritten text-center text-gray-800 mb-1.5" style={{ fontSize: '1.85rem', letterSpacing: '0.12em' }}>
            Your Move
          </h3>
          
          <div className="flex justify-center items-center gap-2.5">
            {(["rock", "paper", "scissors"] as MoveChoice[]).map((move) => (
              <button
                key={move}
                onClick={() => handleMove(move)}
                disabled={!canPlayMove}
                className="game-choice transform hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: '3.8rem', width: '80px', height: '80px' }}
              >
                {moveEmojis[move]}
              </button>
            ))}
          </div>

          {isBusy && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <div className="animate-spin mb-1.5" style={{ fontSize: '2.6rem' }}>⏳</div>
              <div className="text-gray-600 font-medium animate-pulse" style={{ fontSize: '1rem' }}>
                Encrypting & Battling...
              </div>
            </div>
          )}
        </div>

        {/* Right: Round Results */}
        <div className="ghibli-card flex flex-col" style={compactCardStyle}>
          <h3 className="handwritten text-center text-gray-800 mb-1" style={{ fontSize: '1.85rem', letterSpacing: '0.12em' }}>
            History
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
            {snapshot.history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 italic" style={{ fontSize: '1.15rem' }}>
                No battles yet...
              </div>
            ) : (
              snapshot.history.map((result, idx) => (
                <motion.div
                  key={`round-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={clsx(
                    "rounded-md p-1 border transition-colors duration-300",
                    result === 1 
                      ? "bg-green-50 border-green-200"
                      : result === 2
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-mono" style={{ fontSize: '1rem' }}>#{idx + 1}</span>
                    <span 
                      className={clsx(
                        "font-bold",
                        result === 1 
                          ? "text-green-700"
                          : result === 2
                          ? "text-red-700"
                          : "text-gray-600"
                      )}
                      style={{ fontSize: '1.125rem' }}
                    >
                      {getResultText(result)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
