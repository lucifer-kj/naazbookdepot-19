const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      findTSFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix common lint issues
function fixLintIssues(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix any types
  const anyTypeRegex = /:\s*any(?![a-zA-Z])/g;
  if (anyTypeRegex.test(content)) {
    content = content.replace(anyTypeRegex, ': unknown');
    changed = true;
  }
  
  // Fix function parameter any types
  const paramAnyRegex = /\(\s*([^:]+):\s*any\s*\)/g;
  if (paramAnyRegex.test(content)) {
    content = content.replace(paramAnyRegex, '($1: unknown)');
    changed = true;
  }
  
  // Fix array any types
  const arrayAnyRegex = /:\s*any\[\]/g;
  if (arrayAnyRegex.test(content)) {
    content = content.replace(arrayAnyRegex, ': unknown[]');
    changed = true;
  }
  
  // Fix generic any types
  const genericAnyRegex = /<any>/g;
  if (genericAnyRegex.test(content)) {
    content = content.replace(genericAnyRegex, '<unknown>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Main execution
const tsFiles = findTSFiles('./src');
console.log(`Found ${tsFiles.length} TypeScript files`);

tsFiles.forEach(fixLintIssues);

console.log('Lint fixes completed!');