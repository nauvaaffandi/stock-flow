import { Path } from '@angular-devkit/core'
import { Rule, Tree } from '@angular-devkit/schematics'
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder.js'
import { ModuleDeclarator } from '@nestjs/schematics/dist/utils/module.declarator.js'

interface AddToModuleOptions {
    name: string
    path: Path
    metadata: 'controllers' | 'providers' | 'imports'
    type: string
    skipImport?: boolean
}

export function addToModule(options: AddToModuleOptions): Rule {
    return (tree: Tree) => {
        if (options.skipImport) {
            return tree
        }
        
        const module = new ModuleFinder(tree).find({
            name: options.name,
            path: options.path,
        })
        
        if (!module) {
            return tree
        }
        
        const content = tree.read(module)?.toString()
        
        if (!content) {
            return tree
        }
        
        const declarator = new ModuleDeclarator()
        
        tree.overwrite(
            module,
            declarator.declare(content, {
                ...options,
                module,
            })
        )
        
        return tree
    }
}