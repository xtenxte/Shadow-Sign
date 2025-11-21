// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Shadow Sign – Encrypted Rock-Paper-Scissors duel
/// @notice Implements the Shadow Sign gameplay loop entirely with encrypted inputs and outputs.
contract ShadowSign is ZamaEthereumConfig {
    uint8 private constant MOVE_VARIANTS = 3;
    uint8 private constant MAX_ROUNDS = 3;

    struct SeriesState {
        euint8 playerWins;
        euint8 machineWins;
        euint8 lastOutcome;
        euint8 lastPlayerMove;
        euint8 lastMachineMove;
        euint8[3] roundHistory;
        uint8 roundsPlayed;
    }

    mapping(address => SeriesState) private _series;

    event RoundPlayed(address indexed challenger, uint8 roundIndex, euint8 encryptedOutcome);
    event SeriesReset(address indexed challenger);

    /// @notice Plays one encrypted round against the machine.
    /// @param encryptedMove encrypted player move (0=Rock,1=Paper,2=Scissors).
    /// @param proof zk-proof validating the encrypted input against the coprocessor.
    /// @return outcome encrypted round result (0=Draw,1=PlayerWin,2=MachineWin).
    function playRound(externalEuint8 encryptedMove, bytes calldata proof) external returns (euint8 outcome) {
        SeriesState storage state = _series[msg.sender];
        require(state.roundsPlayed < MAX_ROUNDS, "ShadowSign: series finished");

        euint8 playerMove = FHE.fromExternal(encryptedMove, proof);
        euint8 machineMove = _nextMachineMove();

        euint8 normalized = FHE.add(playerMove, FHE.asEuint8(MOVE_VARIANTS));
        normalized = FHE.sub(normalized, machineMove);
        outcome = FHE.rem(normalized, MOVE_VARIANTS);

        state.playerWins = _updatedScore(state.playerWins, outcome, 1);
        state.machineWins = _updatedScore(state.machineWins, outcome, 2);

        state.roundHistory[state.roundsPlayed] = outcome;
        state.roundsPlayed += 1;

        state.lastOutcome = outcome;
        state.lastPlayerMove = playerMove;
        state.lastMachineMove = machineMove;

        _allowSeries(state, msg.sender);

        emit RoundPlayed(msg.sender, state.roundsPlayed, outcome);
    }

    /// @notice Returns the encrypted score line for the caller.
    function getScore() external view returns (euint8 playerWins, euint8 machineWins) {
        SeriesState storage state = _series[msg.sender];
        return (state.playerWins, state.machineWins);
    }

    /// @notice Returns the encrypted moves for the last round that caller played.
    function getLatestMoves() external view returns (euint8 challengerMove, euint8 machineMove) {
        SeriesState storage state = _series[msg.sender];
        return (state.lastPlayerMove, state.lastMachineMove);
    }

    /// @notice Returns encrypted round outcomes (Draw/Win/Lose) for up to three rounds.
    function getRoundHistory() external view returns (euint8[3] memory history, uint8 roundsPlayed) {
        SeriesState storage state = _series[msg.sender];
        return (state.roundHistory, state.roundsPlayed);
    }

    /// @notice Clears every encrypted snapshot for a fresh best-of-three series.
    function resetSeries() external {
        SeriesState storage state = _series[msg.sender];

        state.playerWins = FHE.asEuint8(0);
        state.machineWins = FHE.asEuint8(0);
        state.lastOutcome = FHE.asEuint8(0);
        state.lastPlayerMove = FHE.asEuint8(0);
        state.lastMachineMove = FHE.asEuint8(0);
        state.roundHistory[0] = FHE.asEuint8(0);
        state.roundHistory[1] = FHE.asEuint8(0);
        state.roundHistory[2] = FHE.asEuint8(0);
        state.roundsPlayed = 0;

        _allowSeries(state, msg.sender);

        emit SeriesReset(msg.sender);
    }

    function _nextMachineMove() private returns (euint8) {
        euint8 randomBucket = FHE.randEuint8();
        return FHE.rem(randomBucket, MOVE_VARIANTS);
    }

    function _updatedScore(euint8 currentScore, euint8 outcome, uint8 expectedWinner) private returns (euint8) {
        ebool expected = FHE.eq(outcome, FHE.asEuint8(expectedWinner));
        euint8 increment = FHE.select(expected, FHE.asEuint8(1), FHE.asEuint8(0));
        return FHE.add(currentScore, increment);
    }

    function _allowSeries(SeriesState storage state, address challenger) private {
        _shareValue(state.playerWins, challenger);
        _shareValue(state.machineWins, challenger);
        _shareValue(state.lastOutcome, challenger);
        _shareValue(state.lastPlayerMove, challenger);
        _shareValue(state.lastMachineMove, challenger);
        for (uint256 i = 0; i < state.roundHistory.length; i++) {
            _shareValue(state.roundHistory[i], challenger);
        }
    }

    function _shareValue(euint8 value, address challenger) private {
        if (!FHE.isInitialized(value)) {
            return;
        }
        FHE.allowThis(value);
        FHE.allow(value, challenger);
    }
}

