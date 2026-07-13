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
        const type = options.type
        const message = options.message
        
        const methodName =
            type === 'event' ? 'handle'
            : type === 'command' ? 'execute'
            : 'execute'
        
        const messageDir =
            type === 'event' ? '../../domain/event'
            : type === 'command' ? 'commands'
            : 'queries'
        
        const messagePath = message
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
            .toLowerCase()
        
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
                messagePath,
                handler,
                Ihandler
            }),
            move(sourceRoot)
        ])
        return mergeWith(source)(tree, context)
    }
}
