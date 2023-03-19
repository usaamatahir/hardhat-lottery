import React, { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";

const Lottery = () => {
  const [entryFee, setEntryFee] = useState("0");
  const { chainId: chainIdHEX, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHEX);
  const lotteryAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const { runContractFunction: enterLottery } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "enterLottery",
    params: {},
    msgValue: entryFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  useEffect(() => {
    if (isWeb3Enabled) {
      const getLotterEntranceFee = async () => {
        const entranceFee = (await getEntranceFee()).toString();
        setEntryFee(ethers.utils.formatUnits(entranceFee, "ether"));
      };

      getLotterEntranceFee();
    }
  }, [isWeb3Enabled]);
  //   Win Big with Only 0.1 ETH! Experience the Excitement of our Smart Contract Lottery Today
  //Join the Future of Lotteries with our Smart Contract Lottery - Entry Fee Only 0.1 ETH!

  return (
    <div className="container px-4 mx-auto sm:px-6 lg:px-8">
      <section className="pt-12 sm:pt-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="px-6 text-lg text-gray-600 font-inter">
              Win Big with Only ${entryFee} ETH!
            </h1>
            <p className="mt-5 text-4xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-6xl lg:leading-tight font-pj">
              Join Our Smart Contract Lottery
              <span className="relative inline-flex sm:inline">
                <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-30 w-full h-full absolute inset-0"></span>
                <span className="relative"> Now! </span>
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Lottery;
