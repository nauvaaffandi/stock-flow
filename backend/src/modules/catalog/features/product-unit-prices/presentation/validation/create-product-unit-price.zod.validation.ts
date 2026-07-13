import { z } from 'zod'

export const CreateProductUnitPriceZodValidation = z.object({
	sellingPrice: z.number(),
})
