import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = 'src/modules';
const TARGET_SUFFIX = 'infrastructure/drizzle/schema.ts';
const OUTPUT_FILE = './internal/drizzle_db_schema.ts';

function log(message: string) {
  console.log(`[collector] ${message}`);
}

function findSchemaFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      return; // Skip if can't read
    }
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && fullPath.endsWith(TARGET_SUFFIX)) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function extractExportBlocks(content: string): string[] {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let inExportBlock = false;
  
  for (const line of lines) {
    const trimmed = line.trimStart(); // Use trimStart to preserve indentation
    
    if (trimmed.startsWith('export const')) {
      // Save previous block if any
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
      }
      // Start new block
      currentBlock = [line]; // Keep original line with indentation
      inExportBlock = true;
    } else if (inExportBlock) {
      currentBlock.push(line);
      
      // Heuristic to detect end of block: empty line after significant content, or next export
      // But for safety, continue until next export or end of file
      // Drizzle schema blocks usually end with ); or similar, but we preserve all until next export
    }
  }
  
  // Add the last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }
  
  return blocks;
}

log('Starting Drizzle schema collection...');

if (!fs.existsSync(ROOT_DIR)) {
  log(`Root directory ${ROOT_DIR} not found. Skipping.`);
  process.exit(0);
}

const schemaFiles = findSchemaFiles(ROOT_DIR);
log(`found ${schemaFiles.length} files`);

const allExportBlocks: string[] = [];

for (const file of schemaFiles) {
  log(`processing: ${file}`);
  const content = fs.readFileSync(file, 'utf8');
  
  // Ignore import lines entirely
  const exportBlocks = extractExportBlocks(content);
  allExportBlocks.push(...exportBlocks);
}

const header = [
  '// @ts-nocheck',
  '// TypeScript ignore entire file (collector script)',
  '// AUTO GENERATED FILE',
  '// DRIZZLE SCHEMA AGGREGATED OUTPUT',
  '// DO NOT EDIT MANUALLY',
  '// NOTE: IMPORTS ARE STRIPPED BY DESIGN (DRIZZLE CONTEXT ALREADY RESOLVED AT SOURCE)',
  '',
  '// ================= EXPORTS ================',
  ''
].join('\n');

const outputContent = header + allExportBlocks.join('\n\n');

fs.writeFileSync(OUTPUT_FILE, outputContent);

log(`written -> ${OUTPUT_FILE}`);

console.log('Schema collection completed successfully.');
