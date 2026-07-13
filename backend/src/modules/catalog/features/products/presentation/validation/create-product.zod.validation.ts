import { z } from 'zod'

export const CreateProductZodValidation = z.object({
	categoryId: z.string(),
	name: z.string(),
	sku: z.string(),
	barcode: z.string(),
	baseUnit: z.string(),
	costPrice: z.number(),
	sellingPrice: z.number(),
})
