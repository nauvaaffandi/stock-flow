import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { LoggingModule } from './infrastructure/logging/logging.module'
import { DrizzleModule } from './infrastructure/drizzle/drizzle.module'
import { RequestIdMiddleware } from './shared/middleware/request-id.middleware'
import * as winston from 'winston'
import { WinstonModule } from 'nest-winston'
import { ScheduleModule } from '@nestjs/schedule'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { CatalogModule } from './modules/catalog/catalog.module'
import { ProcurementModule } from './modules/procurement/procurement.module'
import { BarcodeScannerGateway } from './modules/barcode-scanner/barcode-scanner.gateway'
import { CqrsModule } from './infrastructure/cqrs/cqrs.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { SalesModule } from './modules/sales/sales.module'
import { SystemModule } from './modules/system/system.module'

@Module({
	imports: [
		AnalyticsModule,
		LoggingModule,
		DrizzleModule,
		HttpModule,
		ScheduleModule.forRoot(),
		DrizzleModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		WinstonModule.forRoot({
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
			),
			transports: [new winston.transports.Console()],
		}),
		CatalogModule,
		ProcurementModule,
		CqrsModule,
		InventoryModule,
		SalesModule,
		SystemModule,
	],
	controllers: [AppController],
	providers: [AppService, BarcodeScannerGateway],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestIdMiddleware).forRoutes('*')
	}
}
