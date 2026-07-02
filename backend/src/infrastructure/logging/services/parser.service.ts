import { Injectable } from '@nestjs/common';
import * as fs from 'fs'

@Injectable()
export class ParserService {
    
    async tsv(path: string): Promise<any[]> {
        const headers = [
            'timestamp',
            'level',
            'message',
            'context',
            'requestId',
            'userId',
            'method',
            'path',
            'statusCode',
            'duration',
            'service',
            'environment',
            'metadata',
            'trace',
        ]
        
        const content = await fs.promises.readFile(path, 'utf8')
        
        return content
            .trim()
            .split('\n')
            .map((line) => {
                const values = line.split('\t')
                
                return Object.fromEntries(
                    headers.map((key, i) => [key, values[i] ?? null]),
                )
            })
    }
    
}
