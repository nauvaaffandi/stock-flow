import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventBus } from '@nestjs/cqrs'

import * as fs from 'fs'
import * as path from 'path'

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import { ParserService } from './services/parser.service'
import { LogCreatedEvent } from './event/log-created.event'

import type { Payload } from './interface/payload.interface'

@Injectable()
export class LoggerService {
    private logger: winston.Logger
    private level: string

    #extensionLogger = 'log'
    #path = 'logs/logging'
    #env
    
    #lookup = this.#path+'/lookup/'
    
    #maxFiles = 180 // in day
    
    constructor(
        private readonly configService: ConfigService,
        private readonly eventBus: EventBus,
        private readonly parser: ParserService,
    ) {
        this.#env = this.configService.get<string>('NODE_ENV')
        
        this.level = this.#env === 'development'
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

    public info(payload: Payload) {
        this.write('info', payload)
    }

    public warn(payload: Payload) {
        this.write('warn', payload)
    }

    public error(payload: Payload) {
        this.write('error', payload)
    }

    public debug(payload: Payload) {
        this.write('debug', payload)
    }

    public http(payload: Payload) {
        this.write('http', payload)
    }

    public verbose(payload: Payload) {
        this.write('verbose', payload)
    }

    public silly(payload: Payload) {
        this.write('silly', payload)
    }
    
    private write(level: string, payload: any) {
        this.logger.log(level, {
            ...payload,
            environment: this.#env
        })
        
        this.appendLookup('requestId', payload.requestId)
        
        this.logCreatedEvent({
            ...payload,
            environment: this.#env
        }, level)
    }

    public getLookup(field: string, value: any): any[] {
        const filePath = this.getLookupPath(field)
        
        if (!fs.existsSync(filePath)) {
            return []
        }
        
        const lookup = JSON.parse(
            fs.readFileSync(filePath, 'utf8'),
        )
        
        return lookup.filter(obj => 
            obj[field] == value 
        )
    }

    private appendLookup(field: string, value: any) {
        const filePath = this.getLookupPath(field)
        
        fs.mkdirSync(path.dirname(filePath), {
            recursive: true,
        })
        
        const lookup = fs.existsSync(filePath)
            ? JSON.parse(
                fs.readFileSync(filePath, 'utf8'),
            )
            : []
        
        lookup.push({
            [field]: value,
            path: this.getTodayLogPath(),
            timestamp: Date.now(),
        })
        
        fs.writeFileSync(
            filePath,
            JSON.stringify(lookup, null, 2),
        )
    }

    private getTodayLogPath(): string {
        const now = new Date()
        
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        
        return `${this.#path}/${year}-${month}-${day}.${this.#extensionLogger}`
    }
    
    
    
    public getMaxFilesLogger() {
        return `${this.#maxFiles}d`
    }
    public getLogDirectory(): string {
        return this.#path
    }
    public getLookupPath(field: string) {
        return this.#lookup + field + '.json'
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
            filename: `${this.#path}/%DATE%.${this.#extensionLogger}`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '2g',
            maxFiles: `${this.#maxFiles}d`,
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
        const trace = typeof info.trace === 'string'
            ? info.trace
                .split('\n')
                .filter((line) => line.trim().startsWith('at '))
                .map((line) => line.replace('at ', '').trim())
            : []
        
        const log = {
            ...info,
            trace,
        }
        
        return JSON.stringify(log)
    }
}