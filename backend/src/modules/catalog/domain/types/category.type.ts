import type { Replace } from '../../../../types/utilities/replace'



export interface Category {
	id: number
	name: string
	isActive: boolean
	createdAt?: Date
	updatedAt?: Date
}

export type CategoryId = Category['id']
export type CategoryName = Category['name']

export type CategoryContract = Replace<Category, {
    id: string
}>

