import * as Swagger from '@nestjs/swagger'
import type { ProductId, ProductUnitName } from '../../../../../catalog'
import type {
	PurchaseItemQuantity,
	PurchaseItemUnitCost,
} from '../../../../domain/types/purchase-item.type'

export class CreatePurchaseItemDto {
	@Swagger.ApiProperty({
		required: true,
		example: '01KW7HJ9EGHR0R53VAK4GW7TWQ_EwIsIGLglb',
		description: 'id of product',
	})
	productId: ProductId

	@Swagger.ApiProperty({
		required: true,
		example: 'pack',
		description: 'name of product unit',
	})
	unitName: ProductUnitName

	@Swagger.ApiProperty({
		required: true,
		example: 2937,
		description: 'quantity in unit',
	})
	quantity: PurchaseItemQuantity

	@Swagger.ApiProperty({
		required: true,
		example: 70000,
		description: 'price in unit',
	})
	unitCost: PurchaseItemUnitCost
}
