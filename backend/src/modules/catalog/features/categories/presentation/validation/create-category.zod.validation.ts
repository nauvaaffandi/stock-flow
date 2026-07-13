import { z } from 'zod'

export const CreateCategoryZodValidation = z.object({
	name: z.string().min(2),
})
