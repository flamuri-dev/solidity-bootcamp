import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';

const MINT_QTY = 50;

@Injectable()
export class AppService {
  provider: ethers.providers.Provider;

  constructor(private configService: ConfigService) {
    this.provider = ethers.getDefaultProvider('goerli', {
      infura: process.env.INFURA_API_KEY,
      alchemy: process.env.ALCHEMY_API_KEY,
    });
  }

  getTokeninzedBallotAddress() {
    return { result: this.configService.get<string>('TOKENIZED_BALLOT_CONTRACT_ADDRESS'), };
  }

  getMyTokenAddress() {
    return {
      result: this.configService.get<string>('MY_TOKEN_CONTRACT_ADDRESS'),
    };
  }

  async claimTokens(address: string) {
    const seed = this.configService.get<string>('MNEMONIC');
    const contractAddress = this.configService.get<string>(
      'MY_TOKEN_CONTRACT_ADDRESS',
    );
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const signer = wallet.connect(this.provider);
    const signedContract = new ethers.Contract(
      contractAddress,
      tokenJson.abi,
      signer,
    );
    const tx = await signedContract.mint(
      address,
      ethers.utils.parseEther(MINT_QTY.toString()),
    );
    await tx.wait();

    return { result: tx.hash };
  }

  async getBalanceOf(address: string) {
    const seed = this.configService.get<string>('MNEMONIC');
    const contractAddress = this.configService.get<string>(
      'MY_TOKEN_CONTRACT_ADDRESS',
    );
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const signer = wallet.connect(this.provider);
    const signedContract = new ethers.Contract(
      contractAddress,
      tokenJson.abi,
      signer,
    );
    const balanceOfBigNumber = await signedContract.balanceOf(address);

    return { result: ethers.utils.formatEther(balanceOfBigNumber) };
  }
}
