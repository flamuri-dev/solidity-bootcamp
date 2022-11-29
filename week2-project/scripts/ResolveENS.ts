import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = ethers.getDefaultProvider("goerli", {
    infura: process.env.INFURA_API_KEY,
    alchemy: process.env.ALCHEMY_API_KEY,
  });

  const ensToAddress = await provider.resolveName("flamuri.eth");
  console.log(ensToAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
