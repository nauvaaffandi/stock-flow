import { z } from 'zod'

import { TRANSACTION_TYPE } from '../../../../domain/types/transactions.type'

export const CreateTransactionsZodValidation = z.object({
    type: z.enum(Object.values(TRANSACTION_TYPE)),
    notes: z.string().optional(),
})






