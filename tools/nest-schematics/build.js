import { execSync } from 'node:child_process'
import {
    existsSync,
    mkdirSync,
    readdirSync,
    copyFileSync
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = join(__dirname, 'src', 'schematics')
const distDir = join(__dirname, 'dist', 'schematics')

const schematics = readdirSync(srcDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)

// 1. Compile TypeScript
execSync('tsc', { cwd: __dirname, stdio: 'inherit' })

// 2. Copy template files + schema.json for every schematic
for (const name of schematics) {
    const srcTemplates = join(srcDir, name, 'template')
    const distTemplates = join(distDir, name, 'template')

    if (existsSync(srcTemplates)) {
        mkdirSync(distTemplates, { recursive: true })
        
        for (const file of readdirSync(srcTemplates)) {
            if (file.endsWith('.template')) {
                copyFileSync(
                    join(srcTemplates, file),
                    join(distTemplates, file)
                )
            }
        }
    }

    const srcSchema = join(srcDir, name, 'schema.json')

    if (existsSync(srcSchema)) {
        mkdirSync(join(distDir, name), { recursive: true })
        copyFileSync(
            srcSchema,
            join(distDir, name, 'schema.json')
        )
    }
}

console.log('build schematics finish')