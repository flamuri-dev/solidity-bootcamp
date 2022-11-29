import { ethers } from "ethers";
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

  let proposals: string[] = [];

  for (let index = 0; ; index++) {
    try {
      const proposal = await ballotContract.proposals(index);
      proposals.push(ethers.utils.parseBytes32String(proposal.name));
    } catch (e) {
      break;
    }
  }

  console.log("Proposals:");
  proposals.forEach((element, index) => {
    console.log(`Proposal with index ${index}: ${element}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
