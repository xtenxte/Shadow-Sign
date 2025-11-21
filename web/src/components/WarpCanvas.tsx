"use client";

import { useEffect, useRef } from "react";

export function WarpCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number, h: number;
    const stars: Star[] = [];
    const STAR_COUNT = 400;
    const SPEED = 20;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      ctx.setTransform(1, 0, 0, 1, w / 2, h / 2);
    };

    class Star {
      x: number;
      y: number;
      z: number;
      pz: number;

      constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.pz = 0;
        this.init();
      }

      init() {
        this.x = (Math.random() - 0.5) * w * 2;
        this.y = (Math.random() - 0.5) * h * 2;
        this.z = Math.random() * w;
        this.pz = this.z;
      }

      update() {
        this.z -= SPEED;
        if (this.z <= 0) {
          this.init();
          this.z = w;
          this.pz = this.z;
        }
      }

      draw() {
        let x = (this.x / this.z) * w;
        let y = (this.y / this.z) * h;

        let px = (this.x / this.pz) * w;
        let py = (this.y / this.pz) * h;

        this.pz = this.z;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(px, py);

        const opacity = 1 - this.z / w;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = opacity * 2;
        ctx.stroke();
      }
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());

    function animate() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(-w, -h, w * 2, h * 2);

      stars.forEach((star) => {
        star.update();
        star.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="warp-canvas" />;
}

