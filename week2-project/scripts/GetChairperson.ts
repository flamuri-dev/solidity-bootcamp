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

  let ballotContract: Ballot;
  const ballotContractAddress: string =
    "0x999853791f7654d47b0c46f27cda84f62811b32b";

  const ballotContractFactory = new Ballot__factory(signer);
  ballotContract = ballotContractFactory.attach(ballotContractAddress);

  const chairperson = await ballotContract.chairperson();
  console.log("Chairperson address:", chairperson);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
