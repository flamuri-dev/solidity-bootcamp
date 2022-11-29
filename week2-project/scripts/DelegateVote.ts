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
    "m/44'/60'/0'/0/1"
  );
  const signer = wallet.connect(provider);

  const args = process.argv;
  const params = args.slice(2);
  if (params.length != 2) throw new Error("2 arguments needed");

  let ballotContract: Ballot;
  const ballotContractAddress = params[0];
  const ballotContractFactory = new Ballot__factory(signer);
  ballotContract = ballotContractFactory.attach(ballotContractAddress);

  const tx = await ballotContract.delegate(params[1], { gasLimit: 100000 });
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
