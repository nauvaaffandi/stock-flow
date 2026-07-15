import { strings } from '@angular-devkit/core'
import { NameParser } from '@nestjs/schematics'


export default function wrapper(options) {
    const sourceRoot = (options.sourceRoot || 'src').replace(/\/$/, '')
    const parsed = new NameParser().parse(options)
    const className = strings.classify(parsed.name)
    const path = parsed.path
        .split('/')
        .map(segment => strings.dasherize(segment))
        .join('/')
    const fileName = strings.dasherize(className)
    
    return {
        sourceRoot,
        parsed,
        path,
        className,
        fileName,
    }
}







