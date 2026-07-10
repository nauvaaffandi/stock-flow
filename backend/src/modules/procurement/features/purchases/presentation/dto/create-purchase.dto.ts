import * as Swagger from '@nestjs/swagger'
import type {
	Purchase,
	PurchaseStatus,
} from '../../../../domain/types/purchases.type'
import type { SupplierRequest } from '../../../../domain/types/suppliers.type'
import { todayFormatted } from '../../../../../../shared/libs/day-utils'
import { nanoid } from 'nanoid'
import { PURCHASE_STATUS } from '../../../../domain/types/purchases.type'

export class CreatePurchaseDto {
	@Swagger.ApiProperty({
		required: true,
		example: 'SUB/DEV/XYZ',
	})
	supplierId: SupplierRequest['id']

	@Swagger.ApiProperty({
		required: false,
		example: `#INV/${todayFormatted}/${nanoid(8)}`,
		description: 'referenceNumber seperti Id transaction',
	})
	referenceNumber: Purchase['referenceNumber']

	@Swagger.ApiProperty({
		required: true,
		example: 'DRAFT',
		enum: PURCHASE_STATUS,
		description: 'Status dari pembelian stock',
	})
	status: PurchaseStatus

	@Swagger.ApiProperty({
		required: true,
		example: 0,
		description:
			'Aggregate dari seluruh purchase_items.subtotal setelah status di rubah menjadi "RECEIVED"',
	})
	totalCost: Purchase['totalCost']

	@Swagger.ApiProperty({
		required: false,
		example: 'blabla',
	})
	notes: Purchase['notes']
}
