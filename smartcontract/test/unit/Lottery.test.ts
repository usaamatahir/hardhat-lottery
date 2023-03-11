import { developmentChains, networkConfig } from "../../hardhat-helper-config";
import { expect, assert } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { Lottery, VRFCoordinatorV2Mock } from "../../typechain-types";
import { BigNumber } from "ethers";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Lottery Unit Tests", () => {
      let lottery: Lottery;
      let vrfCoordinatorV2: VRFCoordinatorV2Mock;
      let deployer: string;
      let lotteryEntranceFee: BigNumber;
      let interval: BigNumber;
      const chainId = network.config.chainId as number;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        lottery = await ethers.getContract("Lottery");
        vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock");
        lotteryEntranceFee = await lottery.getEntranceFee();
        interval = await lottery.getInterval();
      });

      describe("constructor", () => {
        it("Initialize the Lottery correctly", async () => {
          const lotterState = lottery.getLotteryState();
          const lotteryInterval = await lottery.getInterval();

          assert(lotterState.toString(), "0");
          assert(lotteryInterval.toString(), networkConfig[chainId].interval);
        });

        describe("Enter Lottery", () => {
          it("Expected to be reverted if don't pay enough", async () => {
            const enterLottery = lottery.enterLottery();
            expect(enterLottery).to.be.revertedWith(
              "Lottery_NotEnoughEthEntered"
            );
          });

          it("Record players when entering lottery", async () => {
            await lottery.enterLottery({
              value: lotteryEntranceFee,
              from: deployer,
            });
            const player = await lottery.getParticipants(0);
            const players = await lottery.getNumberOfParticipants();
            assert.equal(player, deployer);
            assert.equal(players.toString(), "1");
          });

          it("Emit an event on enterlottery", async () => {
            expect(
              await lottery.enterLottery({
                value: lotteryEntranceFee,
              })
            ).to.emit(lottery, "LotteryEnter");
          });
          it("doesn't allow entrance when lottery is calculating", async () => {
            await lottery.enterLottery({
              value: lotteryEntranceFee,
            });
            await network.provider.send("evm_increaseTime", [
              interval.toNumber() + 1,
            ]);

            await network.provider.send("evm_mine", []);
            await lottery.performUpkeep([]);
            // Now our lottery is in calculating state, so lets check by entering lottery

            await expect(
              lottery.enterLottery({
                value: lotteryEntranceFee,
              })
            ).to.be.revertedWith("Lottery__NotOpen");
          });
        });

        describe("checkUpkeep", () => {
          it("should return false if people haven't sent any ETH yet", async () => {
            await network.provider.send("evm_increaseTime", [
              interval.toNumber() + 1,
            ]);
            await network.provider.send("evm_mine", []);
            const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded);
          });

          it("should return false if lottery State is not OPEN", async () => {
            await lottery.enterLottery({
              value: lotteryEntranceFee,
            });
            await network.provider.send("evm_increaseTime", [
              interval.toNumber() + 1,
            ]);
            await network.provider.send("evm_mine", []);
            await lottery.performUpkeep([]);
            const lotteryState = await lottery.getLotteryState();
            const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
            assert.equal(lotteryState.toString(), "1");
            assert(!upkeepNeeded);
          });
          it("should return false if  enough time have not passed", async () => {
            await lottery.enterLottery({
              value: lotteryEntranceFee,
            });
            const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded);
          });

          it("should return true if has ETH, enough time passed, and is OPEN", async () => {
            await lottery.enterLottery({
              value: lotteryEntranceFee,
            });
            await network.provider.send("evm_increaseTime", [
              interval.toNumber() + 1,
            ]);
            await network.provider.send("evm_mine", []);
            const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
            assert(upkeepNeeded);
          });
        });

        describe("performUpkeep", () => {
          it("Shoudle execute if checkUpkeep is true", async () => {
            await lottery.enterLottery({
              value: lotteryEntranceFee,
            });
            await network.provider.send("evm_increaseTime", [
              interval.toNumber() + 1,
            ]);
            await network.provider.send("evm_mine", []);
            const tx = await lottery.performUpkeep([]);
            assert(tx);
          });
          it("Shoudle revert if checkUpkeep is false", async () => {
            await expect(lottery.performUpkeep([])).to.be.revertedWith(
              "Lottery__UpkeepNotNeeded"
            );
          });
          it("Should update the lottery state, emit an event, and calls the VRF coordinator", async () => {
            await lottery.enterLottery({
              value: lotteryEntranceFee,
            });
            await network.provider.send("evm_increaseTime", [
              interval.toNumber() + 1,
            ]);
            await network.provider.send("evm_mine", []);
            const txResponse = await lottery.performUpkeep([]);
            const txReceipt = await txResponse.wait(1);
            const lotteryState = await lottery.getLotteryState();
            const requestId = txReceipt!.events![1].args!.requestId.toNumber();
            assert.equal(lotteryState.toString(), "1");
            assert.equal(requestId, 1);
          });
        });
      });
    });
