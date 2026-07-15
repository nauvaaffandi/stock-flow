import {
    apply,
    applyTemplates,
    chain,
    mergeWith,
    move,
    Rule,
    SchematicContext,
    url,
} from '@angular-devkit/schematics'

import { normalize, strings } from '@angular-devkit/core'
import { addToModule } from '../../utils/add-to-module.js'
import wrapper from '../../utils/wrapper.js'

export function mco(options: any): Rule {
    return (tree, context: SchematicContext) => {
        const {
            className,
            sourceRoot,
            fileName,
            path,
        } = wrapper(options)
        
        const tag = options.tag || className
        const endpoint = options.endpoint || className
        const controllerName = `${className}Controller`
        
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                className,
                fileName,
                controllerName,
                tag,
                endpoint: endpoint.toLowerCase(),
            }),
            move(`${sourceRoot}/${path}`)
        ])
        
        return chain([
            mergeWith(source),
            
            addToModule({
                name: className,
                path: normalize(`${sourceRoot}/${path}`),
                metadata: 'controllers',
                type: 'controller',
                skipImport: options.skipImport,
            }),
        ])(tree, context)
    }
}