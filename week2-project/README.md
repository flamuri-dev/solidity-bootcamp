# Week 2 Project

This week's project main goal was to write scripts in order to interact with "Ballot.sol".
The contract was actually deployed to Goerli Testnet (```0x7d445f611a647e156e46ea822eb3b2aa5635551f```) and scripts were run (check the [transactions]).

## Installation
Install all dependencies, create (and edit) your own ```.env``` file and compile the project with Hardhat, using these commands, before actually starting running scripts.

```bash
yarn install
cp .env.example .env
yarn hardhat compile
```

## Usage
Open your favorite Terminal and run these commands.
##### Deployment.ts
```bash
yarn run ts-node --files scripts/Deployment.ts
```
##### ResolveENS.ts
```bash
yarn run ts-node --files scripts/ResolveENS.ts "{ensName}"
```
##### GetChairperson.ts
```bash
yarn run ts-node --files scripts/GetChairperson.ts "{contractAddress}"
```
##### GetProposalsNames.ts
```bash
yarn run ts-node --files scripts/GetProposalsNames.ts "{contractAddress}"
```
##### GetProposalsVotes.ts
```bash
yarn run ts-node --files scripts/GetProposalsVotes.ts "{contractAddress}"
```
##### GiveRightToVote.ts
```bash
yarn run ts-node --files scripts/GiveRightToVote.ts "{contractAddress}" "{voterAddress}" (...) "{lastVoterAddress}"
```
##### Vote.ts
```bash
yarn run ts-node --files scripts/Vote.ts "{contractAddress}" "{proposalIndex}"
```
##### DelegateVote.ts
```bash
yarn run ts-node --files scripts/DelegateVote.ts "{contractAddress}" "{voterAddress}"
```

[transactions]: <https://goerli.etherscan.io/address/0x7d445f611a647e156e46ea822eb3b2aa5635551f>
