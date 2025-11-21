import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { ShadowSign, ShadowSign__factory } from "../typechain-types";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("ShadowSign (FHE)", function () {
  let challenger: HardhatEthersSigner;
  let shadowSign: ShadowSign;
  let shadowSignAddress: string;

  before(async function () {
    [challenger] = await ethers.getSigners();
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    const factory = (await ethers.getContractFactory("ShadowSign")) as ShadowSign__factory;
    shadowSign = (await factory.deploy()) as ShadowSign;
    shadowSignAddress = await shadowSign.getAddress();
  });

  async function playEncryptedRound(move: number) {
    const encryptedMove = await fhevm
      .createEncryptedInput(shadowSignAddress, challenger.address)
      .add8(move)
      .encrypt();

    await shadowSign
      .connect(challenger)
      .playRound(encryptedMove.handles[0], encryptedMove.inputProof);
  }

  it("records encrypted round outcomes for the caller", async function () {
    await playEncryptedRound(0);

    const history = await shadowSign.connect(challenger).getRoundHistory();
    const [encryptedRounds, roundsPlayed] = history;

    expect(Number(roundsPlayed)).to.equal(1);

    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedRounds[0],
      shadowSignAddress,
      challenger,
    );
    const roundOutcome = Number(decrypted);

    expect([0, 1, 2]).to.include(roundOutcome);
  });

  it("resets encrypted score and history", async function () {
    await playEncryptedRound(1);

    await shadowSign.connect(challenger).resetSeries();

    const score = await shadowSign.connect(challenger).getScore();
    const playerScore = Number(
      await fhevm.userDecryptEuint(
      FhevmType.euint8,
      score[0],
      shadowSignAddress,
      challenger,
      ),
    );
    const machineScore = Number(
      await fhevm.userDecryptEuint(
      FhevmType.euint8,
      score[1],
      shadowSignAddress,
      challenger,
      ),
    );

    expect(playerScore).to.equal(0);
    expect(machineScore).to.equal(0);

    const [, roundsPlayed] = await shadowSign.connect(challenger).getRoundHistory();
    expect(Number(roundsPlayed)).to.equal(0);
  });
});

