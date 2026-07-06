import { ApiProperty } from '@nestjs/swagger'
import type { TransactionType } from '../../../../domain/types/transactions.type'


export class CreateTransactionDto {
    @ApiProperty({
        required: true,
        description: 'Type of transaction (SALE / RETURN)',
        example: 'SALE'
    })
    type: TransactionType
    
    @ApiProperty({
        required: true,
        description: 'Notes of transaction',
        example: 'example notes'
    })
    notes: string
}
