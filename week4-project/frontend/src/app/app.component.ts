import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ethers } from 'ethers';
import tokenJson from '../assets/MyToken.json';
import ballotJson from '../assets/Ballot.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  provider: ethers.providers.Provider;
  wallet: ethers.Wallet | undefined;
  importedWallet: ethers.Wallet | undefined;
  importedEnabled: boolean | undefined;
  proposal: any | undefined;
  proposals: string[] | undefined;
  tokenAddress: string | undefined;
  tokenContract: ethers.Contract | undefined;
  ballotContract: ethers.Contract | undefined;
  etherBalance: number | undefined;
  tokenBalance: number | undefined;
  votePower: number | undefined;
  ballotWinner: number | undefined;
  winner: any | undefined;
  vote: string | undefined;

  constructor(private http: HttpClient) {
    this.provider = ethers.providers.getDefaultProvider('goerli');
  }

  createWallet() {
    this.http
      .get<any>('http://localhost:3000/token-address')
      .subscribe((ans) => {
        this.tokenAddress = ans.result;
        if (this.tokenAddress) {
          this.wallet = ethers.Wallet.createRandom().connect(this.provider);
          this.tokenContract = new ethers.Contract(
            this.tokenAddress,
            tokenJson.abi,
            this.wallet
          );
          this.updateInfo();
        }
      });
  }

  private updateInfo() {
    if (this.wallet && this.tokenContract) {
      this.wallet.getBalance().then((balanceBN: ethers.BigNumberish) => {
        this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBN));
      });
      this.tokenContract['balanceOf'](this.wallet.address).then(
        (balanceBN: ethers.BigNumberish) => {
          this.tokenBalance = parseFloat(ethers.utils.formatEther(balanceBN));
        }
      );
      this.tokenContract['getVotes'](this.wallet.address).then(
        (voteBN: ethers.BigNumberish) => {
          this.votePower = parseFloat(ethers.utils.formatEther(voteBN));
        }
      );
    }
  }

  claimTokens() {
    this.http
      .post<any>('http://localhost:3000/claim-tokens', {
        address: this.wallet?.address,
      })
      .subscribe((ans) => {
        const txHash = ans.result;
        this.provider.getTransaction(txHash).then((tx) => {
          tx.wait().then((receipt) => {
            this.updateInfo();
          });
        });
      });
  }

  enableImport() {
    this.importedEnabled = true;
  }

  importWallet(privateKey: string) {
    this.http
      .get<any>('http://localhost:3000/token-address')
      .subscribe((ans) => {
        this.tokenAddress = ans.result;
        if (this.tokenAddress && privateKey) {
          this.wallet = new ethers.Wallet(privateKey, this.provider);
          this.tokenContract = new ethers.Contract(
            this.tokenAddress,
            tokenJson.abi,
            this.wallet
          );
          this.updateInfo();
          this.importedEnabled = false;
        }
      });
  }

  async connectBallot(address: string) {
    this.ballotContract = new ethers.Contract(
      address,
      ballotJson.abi,
      this.wallet
    );
    this.getBallotInfo();
  }

  private async getBallotInfo() {
    if (this.ballotContract) {
      this.proposals = [];
      for (let i = 0; i < 6; i++) {
        this.proposal = await this.ballotContract['proposals'](i);
        this.proposals[i] = ethers.utils.parseBytes32String(this.proposal.name);
      }
    }
  }

  async delegate(to: string) {
    let tx = await this.tokenContract!['delegate'](to);
    console.log(tx);
    this.updateInfo();
  }

  async castVote(vote: string) {
    let tx = await this.ballotContract!['vote'](Number(vote), this.votePower);
    console.log(tx);
  }

  async getWinner() {
    this.winner = await this.ballotContract!['winnerName']();
    this.winner = ethers.utils.parseBytes32String(this.winner);
  }
}
