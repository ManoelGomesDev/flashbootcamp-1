import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3Service } from './web3.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, Web3Service],
})
export class AppModule {}