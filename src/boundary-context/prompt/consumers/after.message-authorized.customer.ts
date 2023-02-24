import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MessageAuthorizedEvent } from 'src/boundary-context/message/events/message-authorized/message-authorized.event';

@Injectable()
export class AfterMessageAuthorizedCustomer {
  @OnEvent('message.authorized')
  async afterMessageAuthorizedCustomer(event: MessageAuthorizedEvent) {}
}
