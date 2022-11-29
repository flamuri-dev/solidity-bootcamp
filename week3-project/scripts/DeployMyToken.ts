import { ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
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

  let myTokenContract: MyToken;
  const myTokenFactory = new MyToken__factory(signer);
  myTokenContract = await myTokenFactory.deploy();
  await myTokenContract.deployed();
  console.log(`"MyToken" contract deployed at address: ${myTokenContract.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
