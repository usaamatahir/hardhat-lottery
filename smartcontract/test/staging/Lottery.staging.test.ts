import { developmentChains, networkConfig } from "../../hardhat-helper-config";
import { expect, assert } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { Lottery } from "../../typechain-types";
import { BigNumber } from "ethers";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Lottery Unit Tests", () => {
      let lottery: Lottery;
      let deployer: string;
      let lotteryEntranceFee: BigNumber;
      const chainId = network.config.chainId as number;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        lottery = await ethers.getContract("Lottery");
        lotteryEntranceFee = await lottery.getEntranceFee();
      });

      describe("fulfillRandomWords", function () {
        it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
          const startingTimestamp = await lottery.getLastTimestamp();
          const accounts = await ethers.getSigners();

          await new Promise<void>(async (resolve, reject) => {
            lottery.once("WinnerPicked", async () => {
              console.log("Winner picked event fired");

              try {
                const recentWinner = await lottery.getRecentWinner();
                const lotteryState = await lottery.getLotteryState();
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimestamp = await lottery.getLastTimestamp();

                await expect(lottery.getParticipants(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(
                  winnerEndingBalance,
                  winnerStartingBalance.add(lotteryEntranceFee.toString())
                );
                assert(
                  endingTimestamp.toString() > startingTimestamp.toString()
                );
                assert.equal(lotteryState.toString(), "0");
              } catch (error) {
                reject(error);
              }
              resolve();
            });

            await lottery.enterLottery({
              value: lotteryEntranceFee,
            });
            const winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
