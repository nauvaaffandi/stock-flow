import { customAlphabet } from 'nanoid'
import { ulid } from 'ulid'

// Definisi alphabet: 0-9, a-z, A-Z
const alphanumericAlphabet =
	'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Bikin fungsi nanoid khusus dengan alphabet di atas
const generateNanoId = customAlphabet(alphanumericAlphabet, 10)

export const randomStrSortable = (length = 10) =>
	`${ulid()}_${generateNanoId(length)}`
