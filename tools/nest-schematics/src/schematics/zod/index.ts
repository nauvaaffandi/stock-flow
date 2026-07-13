import {
    apply,
    applyTemplates,
    mergeWith,
    move,
    Rule,
    SchematicContext,
    url
} from '@angular-devkit/schematics'

import { strings } from '@angular-devkit/core'

import { NameParser } from '@nestjs/schematics'

export function zod(options: any): Rule {
    return (tree, context: SchematicContext) => {
        const sourceRoot = (options.sourceRoot || 'src').replace(/\/$/, '')
        
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                className: strings.classify(new NameParser().parse(options).name)
            }),
            move(sourceRoot)
        ])
        
        return mergeWith(source)(tree, context)
    }
}
