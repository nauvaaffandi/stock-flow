export interface Category {
	id: number
	name: string
	isActive: boolean
	createdAt?: Date
	updatedAt?: Date
}

export type CategoryId = Category['id']
export type CategoryName = Category['name']



export type CategoryResponse = Omit<Category, 'id'> & {
    id: string
}