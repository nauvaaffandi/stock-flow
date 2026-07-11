import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'

import { LoggingModule } from './infrastructure/logging/logging.module'
import { DrizzleModule } from './infrastructure/drizzle/drizzle.module'
import { CqrsModule } from './infrastructure/cqrs/cqrs.module'
import { WinstonModule } from 'nest-winston'
import { ScheduleModule } from '@nestjs/schedule'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'

import { SnakeCaseInterceptor } from './shared/interceptors/snake-case.interceptor'
import { AccessLoggingInterceptor } from './shared/interceptors/access-logging.interceptor'

import { RequestIdMiddleware } from './shared/middleware/request-id.middleware'
import { RequestTimingMiddleware } from './shared/middleware/request-timing.middleware'
import { CamelCaseMiddleware } from './shared/middleware/camel-case.middleware'

import { GlobalErrorFilter } from './shared/filters/global-error.filter'
import { HttpErrorFilter } from './shared/filters/http-error.filter'
import { ZodErrorFilter } from './shared/filters/zod-error.filter'


import * as winston from 'winston'

import { BarcodeScannerGateway } from './modules/barcode-scanner/barcode-scanner.gateway'

import { CatalogModule } from './modules/catalog/catalog.module'
import { ProcurementModule } from './modules/procurement/procurement.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { SalesModule } from './modules/sales/sales.module'
import { SystemModule } from './modules/system/system.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'

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
	providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalErrorFilter,
        },
        {
            provide: APP_FILTER,
            useClass: HttpErrorFilter,
        },
        {
            provide: APP_FILTER,
            useClass: ZodErrorFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: SnakeCaseInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AccessLoggingInterceptor,
        },
        AppService,
        BarcodeScannerGateway,
    ],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(
            RequestIdMiddleware,
            RequestTimingMiddleware,
            CamelCaseMiddleware,
        ).forRoutes('*')
	}
}
