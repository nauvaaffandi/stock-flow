import { LogCreatedEvent } from '../event/log-created.event'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { LoggingGateway } from '../logging.gateway'


@EventsHandler(LogCreatedEvent)
export class LogCreatedHandler 
    implements IEventHandler<LogCreatedEvent>
{
    constructor(
        private readonly gateway: LoggingGateway
    ) {}
    
    
    async handle(event: LogCreatedEvent) {
        this.gateway.server.emit('log.created', event.payload)
    }
}




