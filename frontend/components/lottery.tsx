import React, { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ContractTransaction, ethers, Transaction } from "ethers";

const Lottery = () => {
  const [entryFee, setEntryFee] = useState("0");
  const [participants, setParticipants] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");
  const { chainId: chainIdHEX, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHEX);
  const lotteryAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const { runContractFunction: enterLottery } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "enterLottery",
    msgValue: entryFee,
    params: {},
  });

  const { runContractFunction: getNumOfParticipants } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getNumberOfParticipants",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const {
    runContractFunction: getEntranceFee,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  async function handleSuccess(tx: ContractTransaction) {
    const reponse = await tx.wait(1);
    console.log(reponse);
    const getParticipantsLength = (await getNumOfParticipants()).toString();
    const recentWinner = (await getRecentWinner()).toString();
    setParticipants(getParticipantsLength);
    setRecentWinner(recentWinner);
  }

  async function participateLottery() {
    await enterLottery({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
    });
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      const getLotteryEntranceFee = async () => {
        const entranceFee = (await getEntranceFee()).toString();
        const getParticipantsLength = (await getNumOfParticipants()).toString();
        const recentWinner = (await getRecentWinner()).toString();
        setEntryFee(entranceFee);
        setParticipants(getParticipantsLength);
        setRecentWinner(recentWinner);
      };

      getLotteryEntranceFee();
    }
  }, [isWeb3Enabled]);
  //   Win Big with Only 0.1 ETH! Experience the Excitement of our Smart Contract Lottery Today
  //Join the Future of Lotteries with our Smart Contract Lottery - Entry Fee Only 0.1 ETH!

  console.log("Participants ==> ", participants);
  console.log("Recent Winners ==> ", recentWinner);

  return (
    <div className="container px-4 mx-auto sm:px-6 lg:px-8">
      <section className="pt-12 sm:pt-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="px-6 text-lg text-gray-600 font-inter">
              Win Big with Only ${ethers.utils.formatUnits(entryFee, "ether")}{" "}
              ETH!
            </h1>
            <p className="mt-5 text-4xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-6xl lg:leading-tight font-pj">
              Join Our Smart Contract Lottery
              <span className="relative inline-flex sm:inline">
                <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-30 w-full h-full absolute inset-0"></span>
                <span className="relative"> Now! </span>
              </span>
            </p>
            <button
              className="mt-8 px-6 py-3 text-base font-bold leading-7 text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              role="button"
              onClick={participateLottery}
              disabled={isLoading || isFetching}
            >
              Enter Lottery
            </button>
          </div>
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-1 px-4 mt-12 text-left gap-x-12 gap-y-8 sm:grid-cols-3 sm:px-0">
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0"
                  width="31"
                  height="25"
                  viewBox="0 0 31 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M25.1667 14.187H20.3333C17.6637 14.187 15.5 16.3507 15.5 19.0203V19.8258C15.5 19.8258 18.0174 20.6314 22.75 20.6314C27.4826 20.6314 30 19.8258 30 19.8258V19.0203C30 16.3507 27.8363 14.187 25.1667 14.187Z"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M18.7227 6.9369C18.7227 4.71276 20.5263 2.90912 22.7504 2.90912C24.9746 2.90912 26.7782 4.71276 26.7782 6.9369C26.7782 9.16104 24.9746 11.7702 22.7504 11.7702C20.5263 11.7702 18.7227 9.16104 18.7227 6.9369Z"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <p className="ml-3 text-sm text-gray-900">
                  {participants} participants currently
                </p>
              </div>

              <div className="flex items-center">
                <svg
                  className="flex-shrink-0"
                  width="23"
                  height="23"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.8335 21.9166H3.16683C2.6143 21.9166 2.08439 21.6972 1.69369 21.3065C1.30299 20.9158 1.0835 20.3858 1.0835 19.8333V3.16665C1.0835 2.61411 1.30299 2.08421 1.69369 1.69351C2.08439 1.30281 2.6143 1.08331 3.16683 1.08331H19.8335C20.386 1.08331 20.9159 1.30281 21.3066 1.69351C21.6973 2.08421 21.9168 2.61411 21.9168 3.16665V19.8333C21.9168 20.3858 21.6973 20.9158 21.3066 21.3065C20.9159 21.6972 20.386 21.9166 19.8335 21.9166Z"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7 12.6667L9.25 15L16 8"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <p className="ml-3 text-sm text-gray-900">
                  Recent Winner {recentWinner.slice(0, 4)}...
                  {recentWinner.slice(recentWinner.length - 4)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Lottery;
