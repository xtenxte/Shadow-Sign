"use client";

if (typeof window !== "undefined" && typeof global === "undefined") {
  (window as any).global = window;
}

if (typeof globalThis.indexedDB === "undefined") {
  (globalThis as any).indexedDB = null;
}

if (typeof globalThis.IDBKeyRange === "undefined") {
  (globalThis as any).IDBKeyRange = class {};
}

// Ensure Buffer is also available if needed, though often handled by webpack
// import { Buffer } from 'buffer';
// if (typeof window !== 'undefined' && typeof (window as any).Buffer === 'undefined') {
//   (window as any).Buffer = Buffer;
// }

export {};

