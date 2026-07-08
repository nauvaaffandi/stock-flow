import dirTree from 'directory-tree';
import * as fs from 'fs';
import * as path from 'path';


const tree = dirTree(process.cwd(), {
    exclude: /node_modules|\.git|dist|coverage|\.next/
})

const jsonString = JSON.stringify(tree, null, 4); // null, 2 biar rapi (indented)

console.log(JSON.stringify(tree))

const filePath = path.join(process.cwd(), 'internal', 'tree.json');


const dir = path.dirname(filePath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(filePath, jsonString, 'utf-8');
