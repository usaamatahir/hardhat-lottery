// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

error Lottery_NotEnoughEthEntered();
error Lottery_TransferFailed();
error Lottery__NotOpen();
error Lottery__UpkeepNotNeeded(
    uint256 balance,
    uint256 players,
    uint256 lotteryState
);

contract Lottery is VRFConsumerBaseV2, AutomationCompatibleInterface {
    // 1- Lottery
    // 2- Enter Lottery by paying some amount
    // 3- Select a random winner by Chainlink VRF
    // 4- Select a winner every X minutes by Chainlink Keepers

    /* ENUMS */
    enum LotteryState {
        OPEN,
        CALCULATING
    }

    /* State Variables */

    address payable[] private s_participants;
    uint256 private immutable i_entranceFee;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint256 private immutable i_interval;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private constant NUM_WORDS = 3;
    address private recentWinner;
    LotteryState private s_lotteryState;
    uint256 private s_lastTimeStamp;

    /* Events */

    event LotteryEnter(address indexed player);
    event RequestLotteryWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed recentWinner);

    constructor(
        address vrfCordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCordinatorV2);
        i_entranceFee = entranceFee;
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    function enterLottery() public payable {
        if (s_lotteryState != LotteryState.OPEN) {
            revert Lottery__NotOpen();
        }
        if (msg.value < i_entranceFee) {
            revert Lottery_NotEnoughEthEntered();
        }
        s_participants.push(payable(msg.sender));
        emit LotteryEnter(msg.sender);
    }

    /**
     * @dev This is the function that chainlink keeper nodes call
     * THEY LOOK FOR 'upkeepNeeded' TO BE TRUE
     * THE FOLLOWING SHOULD BE TRUE IN ORDER TO RETURN TRUE
     * 1- OUR TIME INTERNAL SHOULD HAVE PASSED
     * 2- THE LOTTERY SHOULD HAVE ATLEAST ONE PLAYER AND HAVE SOME ETH
     * 3- OUR SUBSCRIPTION IS FUNDED WITH LINK TOKEN
     * 4- THE LOTTERY SHOULD BE IN 'OPEN' STATE
     */

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = (LotteryState.OPEN == s_lotteryState);
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasParticipants = (s_participants.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasParticipants && hasBalance);
        return (upkeepNeeded, "0x00");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Lottery__UpkeepNotNeeded(
                address(this).balance,
                s_participants.length,
                uint256(s_lotteryState)
            );
        }
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestLotteryWinner(requestId);
    }

    function fulfillRandomWords(
        uint256,
        uint256[] memory randomWords
    ) internal override {
        uint256 winnerIndex = randomWords[0] % s_participants.length;
        address payable winner = s_participants[winnerIndex];
        recentWinner = winner;
        s_lotteryState = LotteryState.OPEN;
        s_participants = new address payable[](0);
        s_lastTimeStamp = block.timestamp;

        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Lottery_TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getParticipants(uint256 index) public view returns (address) {
        return s_participants[index];
    }

    function getRecentWinner() public view returns (address) {
        return recentWinner;
    }
}
