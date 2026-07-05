import { Controller, Get, Param, Query } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from './logger.service'
import { ParserService } from './services/parser.service'
import * as fs from 'fs'
import * as path from 'path'
import * as Swagger from '@nestjs/swagger'

@Controller('logs')
export class LoggingController {
    constructor(
        private readonly service: LoggerService,
        private readonly parser: ParserService,
        private readonly configService: ConfigService
    ) {}
    
    @Swagger.ApiExcludeEndpoint(process.env.NODE_ENV == 'development')
    @Get(':requestId')
    async byRequestId(
        @Param('requestId') requestId: string
    ) {
        const lookups = await this.service.getLookup(
            'requestId',
            requestId
        )
        
        if(lookups.length == 0) {
            return {
                success: false,
                message: `(${requestId}) is not found`
            }
        }
        
        const results: any[] = []
        
        for(const lookup of lookups) {
            const result = await this.parser.json(
                lookup.path
            )
            
            results.push(...result)
        }
        
        return {
            success: true,
            data: results.filter(obj => obj.requestId == requestId)
        }
    }
    
    
}