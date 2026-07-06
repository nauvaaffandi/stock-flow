import { customAlphabet } from 'nanoid'
import { ulid } from 'ulid'

const numeric = '0123456789'

const alphanumericAlphabet = numeric+'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const generateNanoId = customAlphabet(alphanumericAlphabet, 10)

export const randomStrSortable = (length = 10) =>
	`${ulid()}_${generateNanoId(length)}`
	
export const randomNumeric = (length = 10) => {
    const generate = customAlphabet(numeric, 10)
    
    return generate(length)
}