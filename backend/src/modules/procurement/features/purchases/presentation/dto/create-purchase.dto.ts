import * as Swagger from '@nestjs/swagger'
import type { PurchaseContract } from '../../../../domain/types/purchases.type'
import type { SupplierContract } from '../../../../domain/types/suppliers.type'
import { todayFormatted } from '../../../../../../shared/libs/day-utils'
import { nanoid } from 'nanoid'
import { PURCHASE_STATUS } from '../../../../domain/types/purchases.type'
import { Identifier, IdentifierPrefix } from '@core/identifier'
export class CreatePurchaseDto {
	@Swagger.ApiProperty({
		required: true,
		example: Identifier.create(IdentifierPrefix.SUPPLIER, 2927),
	})
	supplierId: SupplierContract['id']

	@Swagger.ApiProperty({
		required: false,
		example: `#INV/${todayFormatted()}/${nanoid(8)}`,
		description: 'referenceNumber seperti Id transaction',
	})
	referenceNumber: PurchaseContract['referenceNumber']

	@Swagger.ApiProperty({
		required: true,
		example: 'DRAFT',
		enum: PURCHASE_STATUS,
		description: 'Status dari pembelian stock',
	})
	status: PurchaseContract['status']

	@Swagger.ApiProperty({
		required: true,
		example: 0,
		description: 'Aggregate dari seluruh purchase_items.subtotal setelah status di rubah menjadi "RECEIVED"',
	})
	totalCost: PurchaseContract['totalCost']

	@Swagger.ApiProperty({
		required: false,
		example: 'blabla',
	})
	notes: PurchaseContract['notes']
}
