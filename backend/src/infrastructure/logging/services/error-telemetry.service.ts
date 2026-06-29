import { Injectable } from '@nestjs/common'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

@Injectable()
export class ErrorTelemetryService {
	public logger: winston.Logger

	constructor() {
		this.logger = winston.createLogger({
			level: 'info',
			format: winston.format.combine(
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			),
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.printf((info) => {
							return this.formatLog(info)
						}),
					),
				}),

				new DailyRotateFile({
					filename: `logs/error-telemetry/%DATE%.tsv`,
					datePattern: 'YYYY-MM-DD',
					maxSize: '20m',
					maxFiles: '365d',
					format: winston.format.printf((info) => {
						return this.formatLog(info)
					}),
				}),
			],
		})
	}

	private formatLog(info: any): string {
		const stack = info.stack

		const stackLine =
			typeof stack === 'string'
				? stack
						.split('\n')
						.filter((line) => line.trim().startsWith('at '))
						.map((line) => line.replace('at ', '').trim())
						.join(' --> ')
				: ''

		const reqId = info.reqId ?? '-'
		const method = info.method ?? '-'
		const path = info.path ?? '-'

		return [
			info.timestamp,
			info.level,
			reqId,
			method,
			path,
			stackLine,
		].join('\t')
	}
}
