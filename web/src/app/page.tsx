"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { GhibliBackground } from "@/components/GhibliBackground";
import { GhibliStatusBar } from "@/components/GhibliStatusBar";
import { WalletConnectButton } from "@/components/ui/WalletConnectButton";
import { GameStage } from "@/components/sections/GameStage";

export default function Home() {
  const { isConnected } = useAccount();
  const [showGame, setShowGame] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);

  // Title fade-in animation
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    
    title.style.opacity = "0";
    title.style.transform = "translateY(-20px)";
    
    setTimeout(() => {
      title.style.transition = "all 1.5s ease-out";
      title.style.opacity = "1";
      title.style.transform = "translateY(0)";
    }, 300);
  }, []);

  const handleStartGame = () => {
    if (!isConnected) return;
    setShowGame(true);
    setTimeout(() => {
      if (gameRef.current) {
        const target =
          gameRef.current.getBoundingClientRect().top + window.scrollY - 260;
        window.scrollTo({
          top: target < 0 ? 0 : target,
          behavior: "smooth",
        });
      }
    }, 120);
  };

  return (
    <div className="min-h-screen relative">
      <GhibliBackground />
      <GhibliStatusBar />

      {/* Hero Section - Ghibli Style Home */}
      <div className="relative min-h-screen flex flex-col items-center px-4 z-20" style={{ paddingTop: '3vh' }}>
        <div className="text-center space-y-4">
          {/* Main Title - Extra Large & Bold */}
          <h1
            ref={titleRef}
            className="handwritten text-gray-800 font-bold"
            style={{
              fontSize: "clamp(6rem, 15vw, 12rem)",
              textShadow: "5px 5px 0 rgba(255, 255, 255, 0.9)",
              lineHeight: "1",
              marginBottom: "1rem",
            }}
          >
            Shadow Sign
          </h1>

          {/* Subtitle - Large Artistic Font */}
          <p 
            className="text-gray-700 font-serif italic tracking-wide"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 3rem)",
              marginBottom: "2rem",
            }}
          >
            A mysterious hand gesture duel
          </p>

          {/* Decorative Illustration Area - Large Emojis */}
          <div className="flex justify-center items-center gap-12" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            <div 
              className="animate-bounce" 
              style={{ animationDelay: "0s", fontSize: "clamp(5rem, 10vw, 8rem)" }}
            >
              ✊
            </div>
            <div 
              className="animate-bounce" 
              style={{ animationDelay: "0.2s", fontSize: "clamp(5rem, 10vw, 8rem)" }}
            >
              ✋
            </div>
            <div 
              className="animate-bounce" 
              style={{ animationDelay: "0.4s", fontSize: "clamp(5rem, 10vw, 8rem)" }}
            >
              ✌️
            </div>
          </div>

          {/* Button Group */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style={{ marginTop: "2rem" }}>
            <div className="transform hover:scale-105 transition-transform">
              <WalletConnectButton />
            </div>
            
            {isConnected && (
              <button
                onClick={handleStartGame}
                className="ghibli-button"
              >
                Start Game →
              </button>
            )}
          </div>

          {/* Warm Reminder */}
          {!isConnected && (
            <p className="text-sm text-gray-600 italic" style={{ marginTop: "1rem" }}>
              Please connect your wallet to start
            </p>
          )}
        </div>
      </div>

      {/* Game Interface */}
      {showGame && (
        <div ref={gameRef} className="relative py-16 z-20">
          <GameStage />
        </div>
      )}
    </div>
  );
}
