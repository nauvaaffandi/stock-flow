export interface Category {
	id: number
	name: string
	isActive: boolean
	createdAt?: Date
	updatedAt?: Date
}

export type CategoryId = Category['id']
export type CategoryName = Category['name']
