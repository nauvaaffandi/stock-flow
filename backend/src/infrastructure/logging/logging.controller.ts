import { Controller, Get, Param, Query } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { ParserService } from './services/parser.service'
import * as fs from 'fs'
import * as path from 'path'

@Controller('logs')
export class LoggingController {
    constructor(
        private readonly service: LoggerService,
        private readonly parser: ParserService,
    ) {}

    @Get(':requestId')
    async getByRequestId(
        @Param('requestId') requestId: string,
    ) {
        const path = this.service.getLogPathByRequestId(requestId)
        
        if (!path) {
            return {
                success: false,
                message: `${requestId} not found`,
            }
        }
        
        const results = await this.parser.tsv(path)
        
        const log = results.find(
            (row) => row.requestId === requestId,
        )
        
        if (!log) {
            return {
                success: false,
                message: `${requestId} not found`,
            }
        }
        
        return {
            success: true,
            data: log,
        }
    }

    @Get()
    async logs(
        @Query('page') page = 1,
        @Query('limit') limit = 50,
        
        @Query('timestamp') timestamp?: string,
        @Query('level') level?: string,
        @Query('message') message?: string,
        @Query('context') context?: string,
        @Query('userId') userId?: string,
        
        @Query('method') method?: string,
        @Query('path') requestPath?: string,
        @Query('statusCode') statusCode?: number,
        
        @Query('service') service?: string,
        @Query('environment') environment?: string,
    ) {
        const results: any[] = []
        
        const logDirectory = this.service.getLogDirectory()
        
        const files = fs
            .readdirSync(logDirectory)
            .filter((file) => file.endsWith('.tsv'))
            .map((file) => path.join(logDirectory, file))
        
        for (const file of files) {
            const logs = await this.parser.tsv(file)
            
            for (const log of logs) {
                if (timestamp && log.timestamp !== timestamp) continue
                if (level && log.level !== level) continue
                if (message && !log.message?.includes(message)) continue
                if (context && log.context !== context) continue
                if (userId && log.userId !== userId) continue
                
                if (method && log.method !== method) continue
                if (requestPath && log.path !== requestPath) continue
                if (
                    statusCode &&
                    Number(log.statusCode) !== Number(statusCode)
                )
                    continue
                
                if (service && log.service !== service) continue
                if (environment && log.environment !== environment) continue
                
                results.push(log)
            }
        }
        
        const start = (Number(page) - 1) * Number(limit)
        const end = start + Number(limit)
        
        return {
            success: true,
            data: results.slice(start, end),
        }
    }
}