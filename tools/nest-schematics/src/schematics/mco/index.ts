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
        const endpoint = options.endpoint || className
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                className,
                fileName: strings.dasherize(className),
                controllerName: `${className}Controller`,
                tag: options.tag || className,
                endpoint: endpoint.toLowerCase(),
            }),
            move(sourceRoot)
        ])
        return mergeWith(source)(tree, context)
    }
}
