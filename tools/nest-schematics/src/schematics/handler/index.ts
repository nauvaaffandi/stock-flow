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
        const parsed = new NameParser().parse(options)
        const className = strings.classify(parsed.name)
        const message = options.message
        
        const dashed = message
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
            .toLowerCase()
        
        const type = dashed.split('-').pop()!
        const messageType = dashed
            .split('-')
            .slice(0, -1)
            .join('-')
        
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
        
        const path = parsed.path
            .split('/')
            .map(segment => strings.dasherize(segment))
            .join('/')
        const sourceRoot = (options.sourceRoot || 'src').replace(/\/$/, '')
        const source = apply(url('./template'), [
            applyTemplates({
                ...strings,
                ...options,
                className,
                type,
                methodName,
                messageDir,
                messageType,
                handler,
                Ihandler,
                fileName: strings.dasherize(className),
            }),
            move(`${sourceRoot}/${path}`)
        ])
        
        return mergeWith(source)(tree, context)
    }
}