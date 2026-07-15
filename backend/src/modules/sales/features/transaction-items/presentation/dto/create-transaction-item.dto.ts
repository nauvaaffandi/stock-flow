import * as Swagger from '@nestjs/swagger'
import { Identifier, IdentifierPrefix } from '@core/identifier'

export class CreateTransactionItemDto {
    @Swagger.ApiProperty({
        description: 'Id of product',
        required: true,
        example: Identifier.create(IdentifierPrefix.PRODUCT, 2947)
    })
    productId: string
    
    @Swagger.ApiProperty({
        description: 'Id of product unit',
        required: true,
        example: Identifier.create(IdentifierPrefix.PRODUCT_UNIT, 29437)
    })    
    unitId: string
    
    @Swagger.ApiProperty({
        description: 'quantity of item',
        required: true,
        example: 2
    })
    quantity: number
    
    @Swagger.ApiProperty({
        description: 'price of unit',
        required: true,
        example: 2000,
    })   
    unitPrice: number
    
    @Swagger.ApiProperty({
        description: 'cost of this unit',
        required: true,
        example: 1950,
    })
    unitCost: number
    
    @Swagger.ApiProperty({
        description: 'total of quantity * unitPrice',
        required: true,
        example: 4000
    })
    subtotal: number
}
