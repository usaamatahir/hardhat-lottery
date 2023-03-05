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

const config: HardhatUserConfig = {
  solidity: "0.8.18",
};

export default config;
