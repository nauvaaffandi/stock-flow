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
import wrapper from '../../utils/wrapper.js'

export function message(options: any): Rule {
    return (tree, context: SchematicContext) => {
        const {
            path,
            fileName,
            className,
            sourceRoot,
        } = wrapper(options)
        const type = fileName.split('-').pop()!
        const classType = strings.capitalize(type)
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                fileName,
                className,
                type,
                classType,
            }),
            move(`${sourceRoot}/${path}`)
        ])
        
        return mergeWith(source)(tree, context)
    }
}


