import {
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({
    namespace: '/ws/logging',
})
export class LoggingGateway {
    @WebSocketServer() server: Server
}