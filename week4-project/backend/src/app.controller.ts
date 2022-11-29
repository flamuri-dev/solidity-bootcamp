import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

export class claimTokensDto {
  address: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('tokenized-ballot-address')
  getTokeninzedBallotAddress() {
    return this.appService.getTokeninzedBallotAddress();
  }

  @Get('token-address')
  getMyTokenAddress() {
    return this.appService.getMyTokenAddress();
  }

  @Get('balance-of/:address')
  getBalanceOf(@Param('address') address: string) {
    return this.appService.getBalanceOf(address);
  }

  @Post('claim-tokens')
  claimTokens(@Body() body: claimTokensDto) {
    return this.appService.claimTokens(body.address);
  }
}
