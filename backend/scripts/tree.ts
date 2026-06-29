import dirTree from 'directory-tree'

const tree = dirTree(process.cwd(), {
  exclude: /node_modules|\.git|dist|coverage|\.next/
})

console.log(JSON.stringify(tree))
