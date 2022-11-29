import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import { MyToken } from "../typechain-types/contracts/MyToken";
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
  if (params.length != 2) throw new Error("2 arguments needed");

  let myTokenContract: MyToken;
  const myTokenFactory = new MyToken__factory(signer);
  const myTokenContractAddress = params[0];
  myTokenContract = myTokenFactory.attach(myTokenContractAddress);

  const votePower = await myTokenContract.getVotes(params[1]);
  console.log(`The address ${params[1]} has ${ethers.utils.formatEther(votePower)} voting power`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
