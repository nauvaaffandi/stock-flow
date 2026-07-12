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

export function zod(options: any): Rule {
    return (tree, context: SchematicContext) => {
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                className: strings.classify(options.name)
            }),
            move(options.path || '')
        ])

        context.logger.info('Generating zod validation')

        return mergeWith(source)(tree, context)
    }
}
