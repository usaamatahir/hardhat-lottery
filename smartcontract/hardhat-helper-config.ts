import { BigNumber } from "ethers";
import { ethers } from "hardhat";

interface networkConfigItem {
  blockConfirmations?: number;
  vrfCoordinatorAddress?: string;
  entranceFee?: BigNumber;
  gasLane?: string;
  subscriptionId?: string; //
  callbackGasLimit?: string;
  interval?: string;
}

interface networkConfigInfo {
  [networkId: number]: networkConfigItem;
}

const networkConfig: networkConfigInfo = {
  1337: {
    blockConfirmations: 0,
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callbackGasLimit: "500000",
    interval: "30",
  },
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  // Default one is ETH/USD contract on Kovan
  8: {
    blockConfirmations: 6,
    vrfCoordinatorAddress: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "",
    callbackGasLimit: "500000",
    interval: "30",
  },
  11155111: {
    blockConfirmations: 6,
    vrfCoordinatorAddress: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
  },
  80001: {
    blockConfirmations: 6,
    vrfCoordinatorAddress: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
  },
};

const developmentChains = ["hardhat", "localhost"];

export {
  networkConfigItem,
  networkConfigInfo,
  networkConfig,
  developmentChains,
};
