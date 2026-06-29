import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import type { ZodSchema } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
	constructor(private schema: ZodSchema) {}

	transform(value: any, metadata: ArgumentMetadata) {
		const result = this.schema.safeParse(value)
		if (!result.success) {
			throw result.error
		}
		return result.data
	}
}
