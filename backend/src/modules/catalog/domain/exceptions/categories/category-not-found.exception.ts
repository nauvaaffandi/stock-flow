import type { CategoryName } from '../../types/category.type'

export class CategoryNotFoundException extends Error {
	public static readonly code = 'CATEGORY_NOT_FOUND'
	public static readonly summary = 'Category not found'
	private categoryName: CategoryName

	private static baseMessage(categoryName: CategoryName) {
		return `Category "${categoryName}" not found`
	}

	ApiResponse() {
		return {
			code: CategoryNotFoundException.code,
			message: CategoryNotFoundException.baseMessage(this.categoryName),
		}
	}

	static response(categoryName: CategoryName) {
		return {
			code: CategoryNotFoundException.code,
			message: CategoryNotFoundException.baseMessage(categoryName),
		}
	}

	constructor(categoryName: CategoryName) {
		super(CategoryNotFoundException.baseMessage(categoryName))
		this.categoryName = categoryName
	}
}
