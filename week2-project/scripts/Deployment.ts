import { Ballot, Ballot__factory } from "../typechain-types";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const provider = ethers.getDefaultProvider("goerli", {
    infura: process.env.INFURA_API_KEY,
    alchemy: process.env.ALCHEMY_API_KEY,
  });
  const wallet = ethers.Wallet.fromMnemonic(
    process.env.MNEMONIC ?? "",
    "m/44'/60'/0'/0/0"
  );
  const signer = wallet.connect(provider);

  const args = process.argv;
  const proposals = args.slice(2);
  if (proposals.length <= 0) throw new Error("Not enough arguments");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposal ${index + 1}: ${element}`);
  });

  let ballotContract: Ballot;
  // DEPLOYING THE CONTRACT USING HARDHAT'S ETHERS
  // const ballotContractFactory = await ethers.getContractFactory("Ballot");
  // DEPLOYING THE CONTRACT USING ETHERS
  const ballotContractFactory = new Ballot__factory(signer);
  ballotContract = await ballotContractFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );
  console.log("Deploying Ballot contract");
  await ballotContract.deployed();
  console.log(`Contract deployed to: ${ballotContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
