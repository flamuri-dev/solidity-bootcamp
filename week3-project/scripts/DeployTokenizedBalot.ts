import { ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
import { TokenizedBallot } from "../typechain-types/contracts/TokenizedBallot";
import { TokenizedBallot__factory } from "../typechain-types/factories/contracts/TokenizedBallot__factory";
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
  let proposals = args.slice(2);
  if (proposals.length <= 0) throw new Error("Not enough arguments");
  let blockMarginString = proposals.pop() || "25";
  let blockMargin: number = +blockMarginString;
  let myTokenContract = proposals.pop();
  if (!myTokenContract) throw new Error("Invalid contract address");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposal with index ${index}: ${element}`);
  });
  console.log(`Block margin is: ${blockMargin}`);
  console.log(`Contract address is: ${myTokenContract}`);

  let tokenizedBallotContract: TokenizedBallot;
  const tokenizedBallotFactory = new TokenizedBallot__factory(signer);
  const currentBlockNumber = await provider.getBlockNumber();
  tokenizedBallotContract = await tokenizedBallotFactory.deploy(
    convertStringArrayToBytes32(proposals),
    myTokenContract,
    currentBlockNumber + blockMargin
  );
  await tokenizedBallotContract.deployed();

  console.log(`"TokenizedBallot" contract deployed at address: ${tokenizedBallotContract.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
