# Week 3 Project

This week's project main goal was to write scripts in order to interact with "TokenizedBallot.sol".
The contract was actually deployed to Goerli Testnet (```0x2d2Ad93C4BBCC7e20D0F96dfcaC04B9727a29cCe```) and scripts were run (check the [transactions]).

## Installation
Install all dependencies, create (and edit) your own ```.env``` file and compile the project with Hardhat, using these commands, before actually starting running scripts.

```bash
yarn install
cp .env.example .env
yarn hardhat compile
```

## Usage
Open your favorite Terminal and run these commands.
##### DeployMyToken.ts
```bash
yarn run ts-node --files scripts/DeployMyToken.ts
```
##### DeployTokenizedBalot.ts
```bash
yarn run ts-node --files scripts/DeployTokenizedBalot.ts "{firstProposal}" (...) "{lastProposal}" "{myTokenAddress}" {blockMargin}
```
##### SetMinterRole.ts
```bash
yarn run ts-node --files scripts/SetMinterRole.ts "{myTokenContractAddress}" "{firstAddress}" (...) "{lastAddress}"
```
##### MintERC20.ts
```bash
yarn run ts-node --files scripts/MintERC20.ts "{myTokenContractAddress}" {tokenQuantity}
```
##### DelegateVotes.ts
```bash
yarn run ts-node --files scripts/DelegateVotes.ts "{myTokenContractAddress}" "{delegateToAddress}"
```
##### CastVote.ts
```bash
yarn run ts-node --files scripts/CastVote.ts "{tokenizedBallotContractAddress}" {proposalId} {votePowerQuantity}
```
##### GetVotePower.ts
```bash
yarn run ts-node --files scripts/GetVotePower.ts "{myTokenContractAddress}" "{voterAddress}"
```
##### GetRole.ts
```bash
yarn run ts-node --files scripts/GetRole.ts "{myTokenContractAddress}" "{firstAddress}" (...) "lastAddress"
```
##### GetWinner.ts
```bash
yarn run ts-node --files scripts/GetWinner.ts "{myTokenContractAddress}"
```

[transactions]: <https://goerli.etherscan.io/address/0x2d2Ad93C4BBCC7e20D0F96dfcaC04B9727a29cCe>
