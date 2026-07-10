import dirTree from 'directory-tree'
import * as fs from 'fs'
import * as path from 'path'

const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd()

const tree = dirTree(targetPath, {
   exclude: /node_modules|\.git|dist|coverage|\.next/
})

const normalizeTree = (node: any): any => ({
   ...node,
   path: path.relative(process.cwd(), node.path),
   children: node.children?.map(normalizeTree)
})

const normalizedTree = normalizeTree(tree)

const jsonString = JSON.stringify(normalizedTree, null, 4)

console.log(JSON.stringify(normalizedTree))

const filePath = path.join(process.cwd(), 'internal', 'tree.json')

const dir = path.dirname(filePath)
if (!fs.existsSync(dir)) {
   fs.mkdirSync(dir, { recursive: true })
}

fs.writeFileSync(filePath, jsonString, 'utf-8')

console.log(`✅ Directory tree saved to: ${filePath}`)
console.log(`📍 Scanned path: ${targetPath}`)