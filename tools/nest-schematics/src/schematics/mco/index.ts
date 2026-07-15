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
        const parsed = new NameParser().parse(options)
        const className = strings.classify(parsed.name)
        const sourceRoot = (options.sourceRoot || 'src').replace(/\/$/, '')
        const endpoint = options.endpoint || className
        const path = parsed.path
            .split('/')
            .map(segment => strings.dasherize(segment))
            .join('/')
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
            move(`${sourceRoot}/${path}`)
        ])
        return mergeWith(source)(tree, context)
    }
}
