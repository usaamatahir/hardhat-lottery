import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkConfig, developmentChains } from "../hardhat-helper-config";
import { ethers } from "hardhat";
import { VRFCoordinatorV2Mock } from "../typechain-types/index";
import { verify } from "../utils/verify";

let VRFCoordinatorV2MockContract: VRFCoordinatorV2Mock;
const deployLottery: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId as number;
  const fundAmount = "2000000000000000000";

  let vrfCoordinatorAddress: string;
  let subsciptionId: any;

  if (developmentChains.includes(network.name)) {
    VRFCoordinatorV2MockContract = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorAddress = VRFCoordinatorV2MockContract.address;
    const transactionResponce =
      await VRFCoordinatorV2MockContract.createSubscription();
    const transactionReceipt = await transactionResponce.wait();
    // @ts-expect-error
    subsciptionId = transactionReceipt?.events?.[0].args.subId;

    await VRFCoordinatorV2MockContract.fundSubscription(
      subsciptionId,
      fundAmount
    );
  } else {
    vrfCoordinatorAddress = networkConfig[chainId].vrfCoordinatorAddress || "";
    subsciptionId = networkConfig[chainId].subscriptionId;
  }

  const entranceFee = networkConfig[chainId].entranceFee;
  const gasLane = networkConfig[chainId].gasLane;
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
  const interval = networkConfig[chainId].interval;

  const args = [
    vrfCoordinatorAddress,
    entranceFee,
    gasLane,
    subsciptionId,
    callbackGasLimit,
    interval,
  ];

  const lottery = await deploy("Lottery", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[chainId].blockConfirmations || 0,
  });

  log("----------------------------");
  log("Fundme deployed successfully");
  log("----------------------------");

  await VRFCoordinatorV2MockContract.addConsumer(
    subsciptionId,
    lottery.address
  );

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("----------------------------");
    log("Verify Conract");
    log("----------------------------");

    await verify(lottery.address, args);
  }
};

export default deployLottery;

deployLottery.tags = ["all", "lottery"];
