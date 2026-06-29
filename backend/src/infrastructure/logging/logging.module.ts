import { Module, Global } from '@nestjs/common'
import { ErrorTelemetryService } from './services/error-telemetry.service'

@Global()
@Module({
	providers: [ErrorTelemetryService],
	exports: [ErrorTelemetryService],
})
export class LoggingModule {}
