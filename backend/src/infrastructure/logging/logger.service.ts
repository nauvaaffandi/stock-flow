import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventBus } from '@nestjs/cqrs'

import * as fs from 'fs'
import * as path from 'path'

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import { ParserService } from './services/parser.service'
import { LogCreatedEvent } from './event/log-created.event'

@Injectable()
export class LoggerService {
    private logger: winston.Logger
    private level: string

    #path = 'logs/logging'
    #lookupRequestIdPath = `${this.#path}/lookup/requestId.json`

    constructor(
        private readonly configService: ConfigService,
        private readonly eventBus: EventBus,
        private readonly parser: ParserService,
    ) {
        this.level =
            this.configService.get<string>('NODE_ENV') === 'development'
                ? 'silly'
                : 'info'
        
        this.logger = winston.createLogger({
            level: this.level,
            format: this.createGlobalFormat(),
            transports: [
                this.createConsoleFormat(),
                this.createDailyRotateFormat(),
            ],
        })
    }

    public info(payload: any) {
        this.write('info', payload)
    }

    public warn(payload: any) {
        this.write('warn', payload)
    }

    public error(payload: any) {
        this.write('error', payload)
    }

    public debug(payload: any) {
        this.write('debug', payload)
    }

    public http(payload: any) {
        this.write('http', payload)
    }

    public verbose(payload: any) {
        this.write('verbose', payload)
    }

    public silly(payload: any) {
        this.write('silly', payload)
    }

    public getLogPathByRequestId(requestId: string): string | null {
        if (!fs.existsSync(this.#lookupRequestIdPath)) {
            return null
        }
        
        const lookup = JSON.parse(
            fs.readFileSync(this.#lookupRequestIdPath, 'utf8'),
        )
        
        return lookup[requestId] ?? null
    }

    private write(level: string, payload: any) {
        this.logger.log(level, payload)
        
        this.appendRequestIdLookup(payload.requestId)
        
        this.logCreatedEvent(payload, level)
    }

    private appendRequestIdLookup(requestId?: string) {
        if (!requestId) return
        
        fs.mkdirSync(path.dirname(this.#lookupRequestIdPath), {
            recursive: true,
        })
        
        const lookup = fs.existsSync(this.#lookupRequestIdPath)
            ? JSON.parse(
                  fs.readFileSync(this.#lookupRequestIdPath, 'utf8'),
              )
            : {}
        
        lookup[requestId] = this.getTodayLogPath()
        
        fs.writeFileSync(
            this.#lookupRequestIdPath,
            JSON.stringify(lookup, null, 2),
        )
    }

    private getTodayLogPath(): string {
        const now = new Date()
        
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        
        return `${this.#path}/${year}-${month}-${day}.tsv`
    }
    
    public getLogDirectory(): string {
        return this.#path
    }

    private logCreatedEvent(payload: any, level: string) {
        this.eventBus.publish(
            new LogCreatedEvent({
                ...payload,
                level,
                timestamp: new Date(),
            }),
        )
    }

    private createDailyRotateFormat() {
        return new DailyRotateFile({
            filename: `${this.#path}/%DATE%.tsv`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '2g',
            maxFiles: '180d',
            format: winston.format.printf((info) => {
                return this.formatLog(info)
            }),
        })
    }

    private createConsoleFormat() {
        return new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf((info) => {
                    return this.formatLog(info)
                }),
            ),
        })
    }

    private createGlobalFormat() {
        return winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
        )
    }

    private formatLog(info: any): string {
        const trace =
            typeof info.stack === 'string'
                ? info.stack
                      .split('\n')
                      .filter((line) => line.trim().startsWith('at '))
                      .map((line) => line.replace('at ', '').trim())
                      .join(' --> ')
                : ''
        
        const metadata =
            info.metadata == null
                ? '-'
                : JSON.stringify(info.metadata)
        
        return [
            info.timestamp ?? '-',
            info.level ?? '-',
            info.message ?? '-',
            info.context ?? '-',
            info.requestId ?? '-',
            info.userId ?? '-',
            
            info.method ?? '-',
            info.path ?? '-',
            info.statusCode ?? '-',
            
            info.duration ?? '-',
            info.service ?? '-',
            info.environment ?? process.env.NODE_ENV ?? '-',
            
            metadata,
            
            trace || '-',
        ].join('\t')
    }
}