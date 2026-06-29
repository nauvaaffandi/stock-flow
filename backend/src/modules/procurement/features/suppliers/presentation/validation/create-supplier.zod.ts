import { z } from 'zod'

export const CreateSupplierZodValidation = z.object({
	name: z.string(),
	code: z.string(),
	phone: z
		.string()
		.nullable()
		.optional()
		.transform((v) => v ?? null),
	address: z
		.string()
		.nullable()
		.optional()
		.transform((v) => v ?? null),
})
