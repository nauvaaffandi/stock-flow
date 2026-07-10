import { ConflictException } from '@nestjs/common'

import { IdentifierPrefix } from './prefix'

export { IdentifierPrefix }

type IdentifierPrefixType =
	(typeof IdentifierPrefix)[keyof typeof IdentifierPrefix]

export class Identifier {
    
    static parse(id: string) {
        const [prefix, value] = id.split('-')
        
        const prefixes = Object.values(IdentifierPrefix)
        
        if (!prefix || !prefixes.includes(prefix)) {
			throw new ConflictException({
                code: 'INVALID_ID_IDENTIFIER',
                message: 'Dont abuse!!'
			})
		}
        
		return {
			prefix,
			id: Number(value),
		}
    }
    
    
    static create(prefix: IdentifierPrefixType, id: number) {
        return `${prefix}-${id}`
    }
}













