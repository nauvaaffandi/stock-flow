import { z } from 'zod'

export const CreateTransactionItemZodValidation = z.object({
    productId: z.string().min(3),
    unitId: z.string().min(3),
    quantity: z.number(),
    unitPrice: z.number(),       
    unitCost: z.number(),
    subtotal: z.number(),
})




