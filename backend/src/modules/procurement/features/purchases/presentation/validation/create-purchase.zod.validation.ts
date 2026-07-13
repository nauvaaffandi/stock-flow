import { z } from 'zod'
import { PURCHASE_STATUS } from '../../../../domain/types/purchases.type'

export const PurchaseStatus = z.enum(PURCHASE_STATUS)

export const CreatePurchaseZodValidation = z
	.object({
		supplierId: z.string().min(2).max(100),
		referenceNumber: z.string().optional(),
		status: PurchaseStatus,
		totalCost: z.number(),
		notes: z.string().optional(),
	})
	.transform((val) => {
		Object.keys(val).forEach((key) => {
			if (val[key] === undefined) delete val[key]
		})
        
		return val
	})
