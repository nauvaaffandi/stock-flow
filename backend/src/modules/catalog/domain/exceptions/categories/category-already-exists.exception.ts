import type { CategoryName } from '../../types/category.type'

export class CategoryAlreadyExistsException extends Error {
	public static readonly code = 'CATEGORY_ALREADY_EXISTS'
	public static readonly summary = 'Category already exists'
	private categoryName: CategoryName

	private static baseMessage(categoryName: CategoryName) {
		return `Category "${categoryName}" already exists`
	}

	ApiResponse() {
		return {
			code: CategoryAlreadyExistsException.code,
			message: CategoryAlreadyExistsException.baseMessage(
				this.categoryName,
			),
		}
	}

	static response(categoryName: CategoryName) {
		return {
			code: CategoryAlreadyExistsException.code,
			message: CategoryAlreadyExistsException.baseMessage(categoryName),
		}
	}

	constructor(categoryName: CategoryName) {
		super(CategoryAlreadyExistsException.baseMessage(categoryName))
		this.categoryName = categoryName
	}
}
