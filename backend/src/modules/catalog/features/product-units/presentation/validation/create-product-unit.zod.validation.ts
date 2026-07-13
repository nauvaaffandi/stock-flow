import { z } from 'zod'

export const CreateProductUnitZodValidation = z.object({
	name: z.string(),
	conversionFactor: z.number(),
	isBaseUnit: z.boolean().default(false),
})
