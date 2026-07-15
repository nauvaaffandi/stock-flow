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

export function handler(options: any): Rule {
    return (tree, context: SchematicContext) => {
        const className = strings.classify(new NameParser().parse(options).name)
        const message = options.message
        
        const dashed = message
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
            .toLowerCase()
        
        const messageType = dashed.split('-').pop().replace(/-/g, '')
        const type = messageType
        
        const methodName =
            type === 'event' ? 'handle'
            : type === 'command' ? 'execute'
            : 'execute'
        
        const messageDir =
            type === 'event' ? '../../domain/event'
            : type === 'command' ? 'commands'
            : 'queries'
        
        const handler =
            type === 'event' ? 'EventsHandler'
            : type === 'command' ? 'CommandHandler'
            : 'QueryHandler'
        
        const Ihandler =
            type === 'event' ? 'IEventHandler'
            : type === 'query' ? 'IQueryHandler'
            : 'CommandHandler'
        
        const sourceRoot = (options.sourceRoot || 'src').replace(/\/$/, '')
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                className,
                methodName,
                messageDir,
                messageType,
                handler,
                Ihandler,
                fileName: strings.dasherize(className),
            }),
            move(sourceRoot)
        ])
        
        return mergeWith(source)(tree, context)
    }
}