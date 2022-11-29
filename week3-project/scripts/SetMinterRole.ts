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
  if (params.length <= 0) throw new Error("Not enough arguments");

  let myTokenContract: MyToken;
  const myTokenFactory = new MyToken__factory(signer);
  const myTokenContractAddress = params[0];
  myTokenContract = myTokenFactory.attach(myTokenContractAddress);

  for (let index = 1; index < params.length; index++) {
    const minterRole = await myTokenContract.MINTER_ROLE();
    const setMinterRoleTx = await myTokenContract.grantRole(
      minterRole,
      params[index]
    );
    await setMinterRoleTx.wait();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
