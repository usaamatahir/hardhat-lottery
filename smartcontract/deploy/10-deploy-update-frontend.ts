import {
  frontEndAbiFile,
  frontEndContractsFile,
} from "../hardhat-helper-config";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const updateUI: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { network, ethers } = hre;
  const chainId = "31337";

  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    const lottery = await ethers.getContract("Lottery");
    const contractAddresses = JSON.parse(
      fs.readFileSync(frontEndContractsFile, "utf-8")
    );

    console.log("Contract addresses: " + contractAddresses);
    if (network.name === "localhost" && chainId in contractAddresses) {
      if (
        !contractAddresses[network.config.chainId!]?.includes(lottery.address)
      ) {
        contractAddresses[network.config.chainId!]?.push(lottery.address);
      }
    } else {
      console.log(network.config.chainId);
      contractAddresses[network.config.chainId!] = [lottery.address];
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
    fs.writeFileSync(
      frontEndAbiFile,
      lottery.interface.format(ethers.utils.FormatTypes.json) as string
    );
    console.log("Front end written!");
  }
};
export default updateUI;
updateUI.tags = ["all", "frontend"];
