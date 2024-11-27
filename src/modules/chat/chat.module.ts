import { Module } from '@nestjs/common';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [],
  exports: [],
  providers: [MessageGateway],
  controllers: [],
})
export class ChatModule {}
