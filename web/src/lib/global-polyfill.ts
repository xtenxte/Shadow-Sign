"use client";

if (typeof window !== 'undefined' && typeof global === 'undefined') {
  (window as any).global = window;
}

// Ensure Buffer is also available if needed, though often handled by webpack
// import { Buffer } from 'buffer';
// if (typeof window !== 'undefined' && typeof (window as any).Buffer === 'undefined') {
//   (window as any).Buffer = Buffer;
// }

export {};

