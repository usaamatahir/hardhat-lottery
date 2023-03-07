import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "solidity-coverage";

import * as dotenv from "dotenv";

/** @type import('hardhat/config').HardhatUserConfig */

dotenv.config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const PRIVATE_KEY =
  process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];
const COIN_MARKEYCAP_APIKEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: PRIVATE_KEY,
      chainId: 5,
    },
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COIN_MARKEYCAP_APIKEY,
    token: "MATIC",
  },
  // etherscan: {
  //   apiKey: ETHERSCAN_API_KEY,
  // },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
};

export default config;
