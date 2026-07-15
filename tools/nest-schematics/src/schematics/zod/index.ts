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
        const parsed = new NameParser().parse(options)
        const className = strings.classify(parsed.name)
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                fileName: strings.dasherize(className),
                className,
            }),
            move(`${sourceRoot}/${parsed.path}`)
        ])
        
        return mergeWith(source)(tree, context)
    }
}
