import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  private groups: Record<string, Set<string>> = {};

  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @MessageBody() group: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Ensure that the group is exist
    if (!this.groups[group]) {
      this.groups[group] = new Set();
    }

    this.groups[group].add(client.id);

    client.join(group);
    this.server.to(group).emit('systemMessage', `${client.id} joined ${group}`);
    console.log(this.groups);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() { group, message }: { group: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.groups[group] || !this.groups[group].has(client.id)) {
      client.emit('errorMessage', 'You are not part of this group.');
      return;
    }

    this.server.to(group).emit('message', { sender: client.id, message });
  }

  handleDisconnect(client: Socket) {
    // Clean up client from all groups
    Object.keys(this.groups).forEach((group) => {
      if (this.groups[group].has(client.id)) {
        this.groups[group].delete(client.id);
        this.server
          .to(group)
          .emit('systemMessage', `${client.id} disconnected`);
      }
    });
  }
}
