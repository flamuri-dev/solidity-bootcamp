import { BigNumber, ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

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
  const params = args.slice(2);
  if (params.length <= 0) throw new Error("Not enough arguments");

  let ballotContract: Ballot;
  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContractAddress = params[0];
  ballotContract = ballotContractFactory.attach(ballotContractAddress);

  let votes: number[] = [];

  for (let index = 0; ; index++) {
    try {
      const proposal = await ballotContract.proposals(index);
      const voteCount = BigNumber.from(proposal.voteCount);
      votes.push(voteCount.toNumber());
    } catch (e) {
      break;
    }
  }

  console.log("Proposals:");
  votes.forEach((element, index) => {
    console.log(`Proposal with index ${index}: ${element} votes`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
