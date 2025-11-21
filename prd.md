## Shadow Sign Product Requirements (PRD)

Target program: Zama Developer Program – Builder Track (FHEVM dApp)  
Reference rubric: [Zama Developer Program FAQ](https://docs.zama.ai/programs/developer-program/frequently-asked-questions)

---

### 1. Project Overview

- **Name**: Shadow Sign (intentionally avoids the word “Zama”).  
- **Network**: Ethereum Sepolia testnet.  
- **Privacy layer**: Zama FHEVM 0.9.  
- **Contracts**: Solidity 0.8.24 with `@fhevm/solidity`.  
- **Frontend**: Next.js 14, Wagmi/Viem, RainbowKit, `fhevmjs`.  
- **Wallets**: MetaMask, OKX, Coinbase, Bitget (RainbowKit stack).

Positioning: a single-player “Man vs Machine” duel that shows how FHE keeps every move encrypted while still resolving the match deterministically. Target audiences include investors, Web3 engineers, crypto-privacy fans, and Zama judges.

---

### 2. Goals & Success Metrics

1. **Technical** – complete an end-to-end FHE dApp (encrypt on the client, compute on-chain, decrypt locally).  
2. **Demo** – clearly explain to non-engineers that validators never see the player’s move.  
3. **Program** – satisfy Builder Track deliverables (working demo, docs, tests, deployment info).

Success criteria:
- Best-of-three loop works on Sepolia, contract never stores plaintext, series reset is reliable.
- Encryption/decryption handled exclusively by FHEVM/relayer tooling; no plaintext fallbacks.
- First-time user can finish a match in ≤3 minutes with 1–3 transactions.
- README + PRD, unit tests, deployed frontend, optional 1–3 minute video.

---

### 3. Gameplay Summary

- Gestures: Rock (0), Paper (1), Scissors (2) — represented as `euint8` ciphertexts.
- Winner logic: Rock > Scissors, Scissors > Paper, Paper > Rock.
- Series ends when either side reaches two wins.
- UI layout: left scoreboard, center gesture buttons, right round history, banner for victory/defeat, Reset Game action.

---

### 4. Flow & State Machine

1. **Landing** – hero section, status card, disabled “Start Game” CTA.  
2. **Connect wallet** – RainbowKit modal, enforce Sepolia network, run FHE readiness checks.  
3. **Start Game** – scroll into the arena once wallet/network/FHE are ready; initialize series state.  
4. **Play round** – encrypt choice → submit tx → contract computes encrypted winner → relayer decrypts → UI updates.  
5. **Series end** – once someone hits 2 wins, show banner + Reset button; disable gestures until reset.  
6. **Disconnect/refresh** – revert to INIT; purge decrypted data.

State machine: `INIT` → `WALLET_CONNECTED` → `FHE_READY` → `IN_SERIES` → `SERIES_ENDED`, with any failure jumping back to `INIT`.

---

### 5. Functional Requirements

#### Frontend
- English-only copy in a neon sci-fi style (per `ai_studio_code (3).html` reference).  
- Wallet guardrails (connect, switch network, detect disconnects).  
- FHE readiness indicator (idle/loading/ready/error).  
- Game board with live score, gesture buttons, round history, busy overlay, and Reset button.  
- Loading + error messaging for encrypt, submit, decrypt phases.

#### Smart Contracts
- Accept encrypted moves, generate encrypted machine moves, compute winners entirely on ciphertext.  
- Maintain encrypted scores, last moves, and round history per challenger via `SeriesState`.  
- Use `_shareValue` so the challenger can decrypt handles later.  
- Never log plaintext; randomness via `FHE.randEuint8`.

#### Decryption & Security
- Use the official Relayer SDK for decrypt requests (EIP-712 authorization).  
- Decryption happens only on the challenger’s device; plaintext never touches the blockchain.  
- Provide clear UX when the relayer is unavailable (CORS, 500s, etc.).

---

### 6. UX & Visual Direction

- Dark, neon, sci-fi look with warp-speed background, animated “neural core”, glitch typography, CTA in the lower corner.  
- Hero copy: “Shadow Sign — Encrypted Rock–Paper–Scissors on Zama FHEVM.”  
- Buttons/cards use soft glassmorphism, rounded borders, and subtle parallax.  
- Banner above the gesture buttons announces victory/defeat in bold green text.  
- Smooth scroll from hero to arena when “Start Game” is pressed.

---

### 7. Non-Functional Requirements

- **Performance**: initial load ≤5s on desktop; show progress when Sepolia or relayer latency spikes.  
- **Security**: follow Solidity/FHE best practices, never ship secrets in the repo, avoid plaintext fallbacks.  
- **Compatibility**: Chrome/Brave/Edge on desktop (responsive layout for tablets if time allows).

---

### 8. Development & Testing Plan

1. **Skeleton** – contracts, providers, wallet wiring, hero layout.  
2. **FHE pipeline** – encrypt → submit → wait for receipt → decrypt; integrate relayer.  
3. **UI polish** – state machine, status texts, animations, banners, reset behavior.  
4. **Testing & deploy** – Hardhat unit tests, manual E2E run-through, Vercel deploy, README polish.

Testing scope:
- Contract: every gesture combination, draw handling, repeated series resets.  
- Frontend: wallet connect/disconnect, wrong network path, refresh behavior, decrypt retries.  
- DevOps: deploy/verify scripts, environment variables, relayer availability.

---

### 9. Deliverables

- Source repo (contracts, frontend, tests, docs).  
- Live demo URL configured against the deployed Sepolia contract.  
- README + PRD (English).  
- Optional 1–3 minute narrated video for submission.

Alignment with the Zama rubric:
- **Baseline**: original FHE-enabled contract + functioning demo.  
- **Quality**: documented setup, polished UI/UX, automated tests, optional video.  
- **Differentiators**: emphasizes real encrypted gameplay with clear paths toward multiplayer, wagers, or leaderboards.

---

### 10. Principles

- No plaintext shortcuts; all decisive logic uses ciphertext operations.  
- Decryption happens only on the challenger’s device.  
- Observers cannot infer moves from blockchain data.  
- UX must clearly communicate the privacy benefits (“validators can’t see your move, yet the duel resolves fairly”).

---

