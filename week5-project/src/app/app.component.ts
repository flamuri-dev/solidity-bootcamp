import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ethers } from 'ethers';
import { connect } from 'rxjs';
import tokenJson from '../assets/LotteryToken.json';
import lotteryJson from '../assets/Lottery.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

const LOTTERY_ADDRESS = '0x98cDE7107549659F4a62a0ADA1e1A05e9B27203f';
const TOKEN_ADDRESS = '0x7C4be7D5524902Ed3F52365aA2E6425215EFED8a';
const TOKEN_RATIO = 1000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  provider: any | undefined;
  signer: any | undefined;
  accounts: any | undefined;
  wallet: ethers.Wallet | undefined;
  importedWallet: ethers.Wallet | undefined;
  importedEnabled: boolean | undefined;
  betsOpened: boolean | undefined;
  claimable: boolean = false;
  proposal: any | undefined;
  signerAddress: string | undefined;
  proposals: string[] | undefined;
  tokenAmount: string | undefined;
  tokenAddress: string | undefined;
  yourPrize: string | undefined;
  ownerPool: string | undefined;
  closingTime: Date | undefined;
  tokenContract: ethers.Contract | undefined;
  lotteryContract: ethers.Contract | undefined;
  lotteryAddress: string | undefined;
  lotteryState: string | undefined;
  etherBalance: number | undefined;
  tokenBalance: number | undefined;
  ballotWinner: number | undefined;

  constructor() {}

  async createWallet() {
    this.provider = ethers.providers.getDefaultProvider('goerli');
    this.lotteryAddress = LOTTERY_ADDRESS;
    this.wallet = ethers.Wallet.createRandom();
    this.signer = this.wallet.connect(this.provider);
    this.signerAddress = this.wallet.address;
    this.lotteryContract = new ethers.Contract(
      this.lotteryAddress,
      lotteryJson.abi,
      this.signer
    );
    this.connectToken();
    this.getLotteryInfo();
    this.displayPrize();
    this.displayOwnerPool();
  }

  enableImport() {
    this.importedEnabled = true;
  }

  importWallet(privateKey: string) {
    this.provider = ethers.providers.getDefaultProvider('goerli');
    this.lotteryAddress = LOTTERY_ADDRESS;
    if (this.tokenAddress && privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.signer = this.wallet.connect(this.provider);
      this.signerAddress = this.signer.getAddress();
      this.lotteryContract = new ethers.Contract(
        this.lotteryAddress,
        lotteryJson.abi,
        this.signer
      );

      this.connectToken();
      this.getLotteryInfo();
      this.displayPrize();
      this.displayOwnerPool();

      this.importedEnabled = false;
    }
  }

  async connectWallet() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.lotteryAddress = LOTTERY_ADDRESS;
    await this.provider.send('eth_requestAccounts', []);
    this.accounts = await this.provider.listAccounts();
    this.signer = await this.provider.getSigner();
    this.signerAddress = await this.signer.getAddress();
    this.lotteryContract = new ethers.Contract(
      this.lotteryAddress,
      lotteryJson.abi,
      this.signer
    );

    this.connectToken();
    this.getLotteryInfo();
    this.displayPrize();
    this.displayOwnerPool();
  }

  private updateInfo() {
    if (this.signer && this.tokenContract) {
      this.signer.getBalance().then((balanceBN: ethers.BigNumberish) => {
        this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBN));
      });
      this.tokenContract['balanceOf'](this.signerAddress).then(
        (balanceBN: ethers.BigNumberish) => {
          this.tokenBalance = parseFloat(ethers.utils.formatEther(balanceBN));
        }
      );
    }
  }

  async buyTokens(amount: string) {
    let tx = await this.lotteryContract!['purchaseTokens']({
      value: ethers.utils.parseEther(amount).div(TOKEN_RATIO),
    });
    console.log(tx);
    const receipt = await tx.wait();
    console.log(`Tokens bought (${receipt.transactionHash})\n`);
    this.updateInfo();
  }

  private async connectToken() {
    if (this.lotteryContract) {
      this.tokenAddress = await this.lotteryContract['paymentToken']();
      if (this.tokenAddress) {
        this.tokenContract = new ethers.Contract(
          this.tokenAddress,
          tokenJson.abi,
          this.signer
        );
        this.updateInfo();
      }
    }
  }

  async displayPrize() {
    if (this.lotteryContract) {
      const prizeBN = await this.lotteryContract['prize'](this.signerAddress, {
        gasLimit: 1000000,
      });
      this.yourPrize = ethers.utils.formatEther(prizeBN);
      this.claimable = prizeBN > 0;
      console.log(
        `The account of address ${this.signerAddress} has earned a prize of ${this.yourPrize} Tokens\n`
      );
    }
  }

  async displayOwnerPool() {
    if (this.lotteryContract) {
      const balanceBN = await this.lotteryContract['ownerPool']();
      this.ownerPool = ethers.utils.formatEther(balanceBN);
      console.log(`The owner pool has (${this.ownerPool}) Tokens \n`);
    }
  }

  private async getLotteryInfo() {
    if (this.lotteryContract) {
      this.betsOpened = await this.lotteryContract['betsOpen']();
      this.lotteryState = this.betsOpened ? 'Open' : 'Closed';
      console.log(`The lottery is ${this.lotteryState}\n`);
      if (!this.betsOpened) return;
      const currentBlock = await this.provider.getBlock('latest');
      const currentBlockDate = new Date(currentBlock.timestamp * 1000);
      const closingTime = await this.lotteryContract['betsClosingTime']();
      this.closingTime = new Date(closingTime.toNumber() * 1000);
      console.log(
        `The last block was mined at ${currentBlockDate.toLocaleDateString()} : ${currentBlockDate.toLocaleTimeString()}\n`
      );
      console.log(
        `lottery should close at ${this.closingTime.toLocaleDateString()} : ${this.closingTime.toLocaleTimeString()}\n`
      );
    }
  }

  async openBets(duration: string) {
    if (this.lotteryContract) {
      const currentBlock = await this.provider.getBlock('latest');
      const tx = await this.lotteryContract['openBets'](
        currentBlock.timestamp + Number(duration),
        { gasLimit: 10000000 }
      );
      const receipt = await tx.wait();
      console.log(`Bets opened (${receipt.transactionHash})`);
      this.getLotteryInfo();
      this.updateInfo();
    }
  }

  async closeLottery() {
    if (this.lotteryContract) {
      const tx = await this.lotteryContract['closeLottery']({
        gasLimit: 10000000,
      });
      const receipt = await tx.wait();
      console.log(`Bets closed (${receipt.transactionHash})\n`);
      this.getLotteryInfo();
      this.updateInfo();
      this.displayPrize();
      this.displayOwnerPool();
    }
  }

  async bet(amount: string) {
    if (this.tokenContract) {
      const allowTx = await this.tokenContract['approve'](
        this.lotteryAddress,
        ethers.constants.MaxUint256,
        { gasLimit: 1000000 }
      );
      await allowTx.wait();
      const tx = await this.lotteryContract!['betMany'](amount);
      const receipt = await tx.wait();
      console.log(`Bets placed (${receipt.transactionHash})\n`);
      this.updateInfo();
      this.getLotteryInfo();
      this.displayPrize();
      this.displayOwnerPool();
    }
  }

  async claimPrize(amount: string) {
    if (this.lotteryContract) {
      const tx = await this.lotteryContract['prizeWithdraw'](
        ethers.utils.parseEther(amount),
        {
          gasLimit: 1000000,
        }
      );
      const receipt = await tx.wait();
      console.log(`Prize claimed (${receipt.transactionHash})\n`);
      this.updateInfo();
      this.getLotteryInfo();
      this.displayPrize();
      this.displayOwnerPool();
    }
  }

  async burnTokens(amount: string) {
    if (this.tokenContract) {
      const allowTx = await this.tokenContract['approve'](
        this.lotteryAddress,
        ethers.constants.MaxUint256
      );
      const receiptAllow = await allowTx.wait();
      console.log(`Allowance confirmed (${receiptAllow.transactionHash})\n`);
      const tx = await this.lotteryContract!['returnTokens'](
        ethers.utils.parseEther(amount)
      );
      const receipt = await tx.wait();
      console.log(`Burn confirmed (${receipt.transactionHash})\n`);
      this.updateInfo();
      this.getLotteryInfo();
      this.displayPrize();
      this.displayOwnerPool();
    }
  }

  async ownerWithdraw(amount: string) {
    if (this.lotteryContract) {
      const tx = await this.lotteryContract['ownerWithdraw'](
        ethers.utils.parseEther(amount)
      );
      const receipt = await tx.wait();
      console.log(`Withdrawal confirmed (${receipt.transactionHash})\n`);
      this.updateInfo();
      this.getLotteryInfo();
      this.displayPrize();
      this.displayOwnerPool();
    }
  }
}
