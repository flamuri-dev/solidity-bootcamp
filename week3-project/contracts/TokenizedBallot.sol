// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./MyToken.sol";

contract TokenizedBallot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    MyToken public voteToken;

    Proposal[] public proposals;

    // This declares a state variable that
    // stores which block should be inspected
    uint256 public targetBlock;

    // This declares a state variable that
    // stores the total vote power that was
    // already spent for each possible address.
    mapping(address => uint256) public votePowerSpent;

    constructor(
        bytes32[] memory proposalNames,
        address _voteToken,
        uint256 _targetBlock
    ) {
        voteToken = MyToken(_voteToken);
        targetBlock = _targetBlock;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint proposal, uint256 amount) external {
        require(votePower(msg.sender) >= amount, "not enough vote power");
        proposals[proposal].voteCount += amount;
        votePowerSpent[msg.sender] += amount;
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    function votePower(address account) public view returns (uint256) {
        return
            voteToken.getPastVotes(account, targetBlock) -
            votePowerSpent[account];
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
}
