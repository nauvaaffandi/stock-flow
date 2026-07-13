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

export function mco(options: any): Rule {
    return (tree, context: SchematicContext) => {
        const className = strings.classify(new NameParser().parse(options).name)
        const sourceRoot = (options.sourceRoot || 'src').replace(/\/$/, '')
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                className,
                controllerName: `${className}Controller`,
                tag: options.tag || className,
                endpoint: options.endpoint || className
            }),
            move(sourceRoot)
        ])
        return mergeWith(source)(tree, context)
    }
}
