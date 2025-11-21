import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import type { Hex } from "viem";
import {
  SHADOW_SIGN_ADDRESS,
  PLAY_ROUND_GAS_LIMIT,
  RESET_SERIES_GAS_LIMIT,
} from "@/lib/constants";
import { shadowSignAbi } from "@/lib/abi";
import { encryptMove, decryptHandles } from "@/lib/fhevm";
import { useFhevm } from "@/components/providers/fhevm-provider";

export type MoveChoice = "rock" | "paper" | "scissors";

const MOVE_MAP: Record<MoveChoice, number> = {
  rock: 0,
  paper: 1,
  scissors: 2,
};

const RESULT_LABELS = ["Draw", "Player", "Machine"] as const;

type EncryptedSnapshot = {
  score: { player: Hex; machine: Hex };
  history: { rounds: Hex[]; roundCount: number };
  moves: { player: Hex; machine: Hex };
};

type GameSnapshot = {
  encrypted?: EncryptedSnapshot;
  decryptedScore?: { player: number; machine: number };
  decryptedHistory?: number[];
  decryptedMoves?: { player: number; machine: number };
};

export function useShadowSignGame() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const {
    status: fheStatus,
    ensureReady,
    error: fheError,
  } = useFhevm();
  const { writeContractAsync } = useWriteContract();

  const encryptedRef = useRef<EncryptedSnapshot | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot>({});
  const [isBusy, setIsBusy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusText, setStatusText] = useState<string>("Connect your wallet to begin.");
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchEncryptedState = useCallback(async () => {
    if (!address || !publicClient) {
      return null;
    }

    const [score, history, moves] = await Promise.all([
      publicClient.readContract({
        address: SHADOW_SIGN_ADDRESS,
        abi: shadowSignAbi,
        functionName: "getScore",
        account: address,
      }) as Promise<[Hex, Hex]>,
      publicClient.readContract({
        address: SHADOW_SIGN_ADDRESS,
        abi: shadowSignAbi,
        functionName: "getRoundHistory",
        account: address,
      }) as Promise<readonly [readonly Hex[], bigint]>,
      publicClient.readContract({
        address: SHADOW_SIGN_ADDRESS,
        abi: shadowSignAbi,
        functionName: "getLatestMoves",
        account: address,
      }) as Promise<[Hex, Hex]>,
    ]);

    const normalizedHistory = history[0].slice(
      0,
      Number(history[1]),
    ) as Hex[];

    const payload: EncryptedSnapshot = {
      score: { player: score[0], machine: score[1] },
      history: { rounds: normalizedHistory, roundCount: Number(history[1]) },
      moves: { player: moves[0], machine: moves[1] },
    };

    encryptedRef.current = payload;
    setSnapshot((prev) => ({
      ...prev,
      encrypted: payload,
    }));
    return payload;
  }, [address, publicClient]);

  const decryptSnapshot = useCallback(
    async (payload?: EncryptedSnapshot | null) => {
      if (!payload) {
        return;
      }
      if (!walletClient || !address) {
        return;
      }
      if (fheStatus !== "ready") {
        await ensureReady();
      }

      const handles = Array.from(
        new Set(
          [
            payload.score.player,
            payload.score.machine,
            payload.moves.player,
            payload.moves.machine,
            ...payload.history.rounds,
          ].filter(Boolean) as Hex[],
        ),
      );

      if (handles.length === 0) return;

      const decryptedMap = await decryptHandles(
        handles,
        SHADOW_SIGN_ADDRESS,
        walletClient,
      );

      const decryptedScore = {
        player: decryptedMap[payload.score.player] ?? 0,
        machine: decryptedMap[payload.score.machine] ?? 0,
      };
      const decryptedMoves = {
        player: decryptedMap[payload.moves.player] ?? -1,
        machine: decryptedMap[payload.moves.machine] ?? -1,
      };
      const decryptedHistory = payload.history.rounds.map(
        (handle) => decryptedMap[handle] ?? 0,
      );

      setSnapshot((prev) => ({
        ...prev,
        decryptedScore,
        decryptedMoves,
        decryptedHistory,
      }));
    },
    [address, walletClient, fheStatus, ensureReady],
  );

  const refreshState = useCallback(
    async (options?: { silent?: boolean; label?: string; decrypt?: boolean }) => {
      if (!address) {
        return;
      }
      const { silent = false, label, decrypt = true } = options ?? {};
      if (!silent && label) {
        setStatusText(label);
      }
      setIsRefreshing(true);
      try {
        const payload = await fetchEncryptedState();
        if (decrypt) {
          await decryptSnapshot(payload ?? encryptedRef.current);
        }
        if (!silent && !label) {
          setStatusText("Encrypted duel data updated.");
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to sync encrypted state";
        setLastError(message);
        if (!silent) {
          setStatusText("Failed to sync encrypted state.");
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [address, decryptSnapshot, fetchEncryptedState],
  );

  useEffect(() => {
    if (!isConnected) {
      setSnapshot({});
      encryptedRef.current = null;
      setStatusText("Connect your wallet to begin.");
      return;
    }
    refreshState({ silent: true, decrypt: false });
  }, [isConnected, refreshState]);

  const derived = useMemo(() => {
    const score = snapshot.decryptedScore ?? { player: 0, machine: 0 };
    const playerAhead = score.player >= 2;
    const machineAhead = score.machine >= 2;

    return {
      score,
      history: snapshot.decryptedHistory ?? [],
      moves: snapshot.decryptedMoves ?? { player: -1, machine: -1 },
      seriesOver: playerAhead || machineAhead,
      victor: playerAhead ? "player" : machineAhead ? "machine" : null,
    };
  }, [snapshot]);

  const playRound = useCallback(
    async (choice: MoveChoice) => {
      if (derived.seriesOver) {
        setStatusText("Series finished. Tap reset to duel again.");
        setLastError("Series already settled.");
        return;
      }

      if (!address) {
        throw new Error("Wallet not connected");
      }
      if (!walletClient) {
        throw new Error("No wallet client available");
      }

      await ensureReady();

      setIsBusy(true);
      setLastError(null);
      setStatusText("Encrypting your move…");

      try {
        const encrypted = await encryptMove(
          SHADOW_SIGN_ADDRESS,
          address,
          MOVE_MAP[choice],
        );

        setStatusText("Submitting the encrypted duel to Sepolia…");

        const txHash = await writeContractAsync({
          address: SHADOW_SIGN_ADDRESS,
          abi: shadowSignAbi,
          functionName: "playRound",
          args: [encrypted.handle, encrypted.proof],
          gas: PLAY_ROUND_GAS_LIMIT,
        });

        setStatusText("Waiting for Sepolia confirmation…");
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: txHash });
        }

        setStatusText("Syncing on-chain state…");

        await refreshState({ silent: true, decrypt: true });
        setStatusText("Round settled — decrypting outcome.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setLastError(message);
        setStatusText("Something went wrong. Try again?");
        throw error;
      } finally {
        setIsBusy(false);
      }
    },
    [
      address,
      walletClient,
      ensureReady,
      writeContractAsync,
      refreshState,
      publicClient,
      derived.seriesOver,
    ],
  );

  const resetSeries = useCallback(async () => {
    if (!address) return;
    setIsBusy(true);
    setLastError(null);
    setStatusText("Resetting encrypted arena…");

    const previousSnapshot = snapshot;
    setSnapshot({});

    try {
      const txHash = await writeContractAsync({
        address: SHADOW_SIGN_ADDRESS,
        abi: shadowSignAbi,
        functionName: "resetSeries",
        gas: RESET_SERIES_GAS_LIMIT,
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      await refreshState({ silent: true, decrypt: false });
      setStatusText("Series reset. Ready when you are.");
    } catch (error) {
      setSnapshot(previousSnapshot);
      const message =
        error instanceof Error ? error.message : "Unable to reset series";
      setLastError(message);
      setStatusText("Reset failed.");
    } finally {
      setIsBusy(false);
    }
  }, [address, snapshot, writeContractAsync, refreshState, publicClient]);

  return {
    snapshot: derived,
    rawSnapshot: snapshot,
    statusText,
    isBusy,
    isRefreshing,
    lastError,
    fheError,
    fheStatus,
    playRound,
    resetSeries,
    refreshState,
  };
}

