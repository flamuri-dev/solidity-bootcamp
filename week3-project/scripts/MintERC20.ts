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

  const args = process.argv;
  const params = args.slice(2);
  if (params.length != 2) throw new Error("2 arguments needed");

  let myTokenContract: MyToken;
  const myTokenFactory = new MyToken__factory(signer);
  const myTokenContractAddress = params[0];
  myTokenContract = myTokenFactory.attach(myTokenContractAddress);

  const mintTx = await myTokenContract.mint(
    signer.address,
    ethers.utils.parseEther(params[1])
  );
  await mintTx.wait();
  const delegateTx = await myTokenContract.delegate(signer.address);
  await delegateTx.wait();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
