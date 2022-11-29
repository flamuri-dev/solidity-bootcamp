import { ethers } from "ethers";
import { TokenizedBallot } from "../typechain-types/contracts/TokenizedBallot";
import { TokenizedBallot__factory } from "../typechain-types/factories/contracts/TokenizedBallot__factory";
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
  if (params.length != 3) throw new Error("3 arguments needed");

  let tokenizedBallotContract: TokenizedBallot;
  const tokenizedBallotFactory = new TokenizedBallot__factory(signer);
  const tokenizedBallotContractAddress = params[0];
  tokenizedBallotContract = tokenizedBallotFactory.attach(tokenizedBallotContractAddress);

  const castVoteTx = await tokenizedBallotContract.vote(params[1], ethers.utils.parseEther(params[2]));
  await castVoteTx.wait();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
