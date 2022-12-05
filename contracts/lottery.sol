// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        // require is used to check any condition before running the function
        // if the condition fails, the remaining function doesnt get executed
        // In this case, it's used to check the minimum number of ethers required to enter the lottery
        require(msg.value > 0.001 ether);

        // One condition satisfies, we can directly enter the player into the lottery using below code
        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        // Using keccak256 algorithm to generate a random number
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public restrictedToManager {
        // picking winner player's index
        uint choosenWinnerIndex = random() % players.length;

        // Transferring all available ethers in the account to the winner player
        payable(players[choosenWinnerIndex]).transfer(address(this).balance);

        // Resetting players array to empty array again so that we can reuse contract without deploying it again
        players = new address[](0);
    }

    // Function modifiers helps to neat up the code by removing the redundant code and putting them in function statement
    modifier restrictedToManager() {
        // requiring manager making sure that only manager is able use pick winner function
        require(msg.sender == manager);
        _;
    }
}