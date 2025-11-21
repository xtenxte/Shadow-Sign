# Shadow Sign
> Encrypted Man vs Machine duels powered by Zama FHEVM.

Shadow Sign is a best-of-three rock–paper–scissors arena where both the challenger and the machine fight entirely under encryption.  

**Rules in plain terms:**
- You choose one of three gestures: **Rock (✊)**, **Paper (✋)**, or **Scissors (✌️)**.
- Rock beats Scissors, Scissors beats Paper, and Paper beats Rock.
- Each encrypted round produces a hidden outcome (Win / Lose / Draw); the first side to win **two rounds** wins the series.

Moves, scores, and round history never leak as plaintext on-chain: the Solidity contract consumes encrypted inputs, computes encrypted outcomes, and the player decrypts results locally through Zama's Relayer SDK.

## Vision & Narrative
- **Why FHE?** Rock–paper–scissors is trivial in plaintext but perfect to demonstrate FHE's promise: even validators cannot see either side's move, yet the contract decides winners deterministically.
- **Demo focus**: A single-player “Man vs Machine” duel with neon UI, wallet gating, and real Sepolia execution.
- **Business lens**: This pattern generalizes to sealed-bid auctions, private match-making, or strategy reveals where fairness hinges on secrecy.

## Stack
| Layer | Details |
| --- | --- |
| Smart Contracts | Solidity 0.8.24, Hardhat 2.26, `@fhevm/solidity@0.9`, `@fhevm/hardhat-plugin` for mock testing |
| Frontend | Next.js 14 (App Router) + Tailwind 4 + RainbowKit/Wagmi + `@zama-fhe/relayer-sdk/web` (Relayer SDK 0.3.0-5 via dynamic import) |
| Tooling | pnpm workspace (`contracts`, `web`), TypeScript everywhere, ESLint flat config, Framer Motion for hero/arena motion |

## Workspace Setup
```bash
pnpm install      # installs deps for both packages/
pnpm --filter contracts build
pnpm --filter web dev
```

### Environment variables

| Location | File | Purpose |
| --- | --- | --- |
| root (Hardhat) | `env.example` → `.env` | `SEPOLIA_RPC_URL`, `SHADOW_SIGN_DEPLOYER_KEY`, `ETHERSCAN_API_KEY`, `SHADOW_SIGN_ADDRESS` (for verify script) |
| frontend | `web/env.local.example` → `web/.env.local` | `NEXT_PUBLIC_SHADOW_SIGN_ADDRESS`, `NEXT_PUBLIC_SEPOLIA_RPC`, `NEXT_PUBLIC_WALLETCONNECT_ID` |

> The repo purposefully ignores `.env*`; copy the examples to your local files before running commands.

## Contracts
Key file: `contracts/contracts/ShadowSign.sol`
- Maintains encrypted scores (`euint8`), last moves, and round history per challenger.
- Generates the machine's stance with `FHE.randEuint8()` and never exposes plaintext.
- `_shareValue` ensures both the contract and challenger retain access to encrypted values for future operations.
- Round history is now unbounded (dynamic array), so prolonged draw streaks can continue until someone reaches two wins without forcing a manual reset.

### Scripts
| Command | Description |
| --- | --- |
| `pnpm --filter contracts build` | Compile with optimizer + viaIR |
| `pnpm --filter contracts test` | Run FHE mock tests (`test/ShadowSign.ts`) via `@fhevm/hardhat-plugin` |
| `pnpm --filter contracts deploy:sepolia` | Deploy using `scripts/deployShadowSign.ts` (requires `.env`) |
| `pnpm --filter contracts verify:sepolia` | Verify deployed bytecode; set `SHADOW_SIGN_ADDRESS` beforehand |

Mock tests cover encrypted round recording and reset flows, decrypting values through the plugin to assert expected behaviors.

## Frontend
Run the UI from `web/`:
```bash
cd web
pnpm dev           # http://localhost:3000
pnpm lint          # ESLint (core-web-vitals rules)
```

Highlights:
- **Hero section** with a playful studio background and a CTA that scrolls into the arena.
- **GameStage** enforces wallet/network/FHE guardrails, renders the three-column layout (Score / Your Move / History), performs encrypted rounds, shows a victory banner when a series ends, and disables moves until “Reset Game” is clicked.
- **State management** lives in `useShadowSignGame.ts`: encrypts moves, submits tx via Wagmi with fixed gas caps, waits for Sepolia confirmation, refreshes encrypted state, and triggers decrypt via the Relayer SDK. Errors and FHE init issues bubble up to the UI.
- **FHE Provider** (`src/components/providers/fhevm-provider.tsx`) dynamically loads the Relayer SDK from `@zama-fhe/relayer-sdk/web`, initializes an instance against the connected wallet provider, and exposes readiness/error info.

## Recommended Flow for Demo Prep
1. **Setup env files** (backend + frontend) with real Sepolia RPC and wallet keys.
2. **Deploy & verify** using the provided scripts, copy the contract address to `web/.env.local`.
3. **Run `pnpm dev`** and walk through: connect wallet → ensure FHE status “ready” → click “Start Game” → play encrypted rounds until someone reaches 2 wins → use “Reset Game” to start a new series.
4. **Document** the deployed address + live frontend URL in this README before submission.

## Deployment
- **Network**: Sepolia  
- **Contract**: `0x78675755b8c2eaF5b6184bCf56A06102cBACdC23`  
- **Etherscan**: https://sepolia.etherscan.io/address/0x78675755b8c2eaF5b6184bCf56A06102cBACdC23

> Use `pnpm --filter contracts run deploy:sepolia` with the provided wallet/RPC to redeploy if needed. After deployment, run the `verify:sepolia` script (requires `ETHERSCAN_API_KEY` & `SHADOW_SIGN_ADDRESS` envs).

### Frontend Environment (optional)
The web app already ships with sensible public defaults, so Vercel deployments work even without configuring environment variables.  
Only create `web/.env.local` if you want to **override** the baked-in values (e.g. point to a different contract or RPC):
```
NEXT_PUBLIC_SHADOW_SIGN_ADDRESS=0x78675755b8c2eaF5b6184bCf56A06102cBACdC23
NEXT_PUBLIC_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/xeMfJRSGpIGq5WiFz-bEiHoG6DGrZnAr
NEXT_PUBLIC_WALLETCONNECT_ID=<your_walletconnect_project_id>
```

Then run `pnpm dev` from `web/`. (RainbowKit only uses the WalletConnect ID if you override it; the bundled placeholder works for injected wallets such as MetaMask/OKX/Coinbase/Bitget.)

## Deployment Checklist
- [x] Contract deployed + verified on Sepolia (address recorded above).
- [ ] Frontend configured against the deployed address and live on Vercel/Netlify.
- [ ] Demo video (prepared separately) that walks through the full flow.
- [x] README captures run/deploy/troubleshooting notes.
- [x] No private keys or RPC URLs committed (use temporary env vars).

## Troubleshooting
- **FHE status stuck on “loading”**: check the browser console/network tab for calls to `https://relayer.testnet.zama.org/v1/user-decrypt`. If you see CORS errors or `500` responses, the relayer testnet may be temporarily unavailable.
- **Decrypt requests failing intermittently**: wait and retry a round later; repeated `500`/CORS errors are almost always a relayer-side issue rather than an app bug.
- **Hardhat tests skip**: the plugin runs only on the mock network. If you run tests against Sepolia, they are skipped by design.

With these foundations, we can iterate on UI polish, integrate additional encrypted telemetry, or expand toward multiplayer scenarios—all while staying faithful to FHE’s trustless privacy guarantees.

