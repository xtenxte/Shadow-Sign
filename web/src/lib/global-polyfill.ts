"use client";

if (typeof window !== "undefined" && typeof global === "undefined") {
  (window as any).global = window;
}

if (typeof globalThis.indexedDB === "undefined") {
  // Provide a minimal no-op mock for SSR environments where indexedDB isn't available
  (globalThis as any).indexedDB = {
    open: () => ({
      onerror: null,
      onsuccess: null,
      result: null,
    }),
    deleteDatabase: () => ({}),
    databases: async () => [],
  };
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

