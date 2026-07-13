import { z } from 'zod'

export const CreatePurchaseItemZodValidation = z.object({
	productId: z.string(),
	unitName: z.string(),
	quantity: z.number().min(1),
	unitCost: z.number().min(1),
})
