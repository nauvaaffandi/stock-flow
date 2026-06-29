import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets'

import { Server, Socket } from 'socket.io'

@WebSocketGateway({
	namespace: '/ws/barcode-scanner',
	cors: {
		origin: '*',
	},
})
export class BarcodeScannerGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server

	handleConnection(client: Socket) {
		console.log('connected', client.id)
	}

	handleDisconnect(client: Socket) {
		console.log('disconnected', client.id)
	}

	@SubscribeMessage('barcode_room.join')
	handleJoin(
		@MessageBody() data: { room: string },
		@ConnectedSocket() client: Socket,
	) {
		client.join(data.room)
	}

	@SubscribeMessage('barcode.scan')
	handleScan(
		@MessageBody() payload: { barcode: string; room: string },
		@ConnectedSocket() client: Socket,
	) {
		client.to(payload.room).emit('barcode.result', {
			barcode: payload.barcode,
		})
	}
}
