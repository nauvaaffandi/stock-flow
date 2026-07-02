import { Module, Global } from '@nestjs/common'
import { ErrorTelemetryService } from './services/error-telemetry.service'
import { ParserService } from './services/parser.service';
import { LoggerService } from './logger.service';
import { LoggingController } from './logging.controller';
import { LogCreatedHandler } from './handlers/log-created.handler'
import { LoggingGateway } from './logging.gateway';


@Global()
@Module({
	providers: [ErrorTelemetryService, ParserService, LoggerService, LogCreatedHandler, LoggingGateway],
	exports: [ErrorTelemetryService, LoggerService],
	controllers: [LoggingController],
})
export class LoggingModule {}
