import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { network } from "hardhat";
import { developmentChains } from "../hardhat-helper-config";

const BASE_FEE = "250000000000000000";
const GAS_PRICE_LINK = 1e9;

const deployMocks: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks");

    await deploy("VRFCoordinatorV2Mock", {
      contract: "VRFCoordinatorV2Mock",
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });

    log("----------------------------");
    log("Mocks deployed successfully");
    log("----------------------------");
  }
};
export default deployMocks;
deployMocks.tags = ["all", "mocks"];

// module.exports.tags = ["all", "mocks"];
