const fs = require('fs');
const path = require('path');

const errorLogPath = path.join(__dirname, 'ts-errors.txt');
const errorLog = fs.readFileSync(errorLogPath, 'utf8');

const regex = /^(.+\.tsx?)\((\d+),\d+\): error (TS\d+): (.*)$/gm;
let match;
const errorsByFile = {};

while ((match = regex.exec(errorLog)) !== null) {
  const file = match[1];
  const line = parseInt(match[2], 10);
  const errorCode = match[3];
  const message = match[4];

  if (!errorsByFile[file]) {
    errorsByFile[file] = [];
  }
  // Store line (1-indexed)
  errorsByFile[file].push({ line, errorCode, message });
}

for (const [file, errors] of Object.entries(errorsByFile)) {
  const absolutePath = path.join(__dirname, file);
  if (!fs.existsSync(absolutePath)) {
    console.log(`File not found: ${absolutePath}`);
    continue;
  }
  
  let lines = fs.readFileSync(absolutePath, 'utf8').split('\n');
  
  // Sort errors by line descending to insert without messing up earlier line numbers
  // Unique by line number so we don't insert multiple comments for the same line
  const uniqueErrors = [];
  const seenLines = new Set();
  
  // Sort descending
  errors.sort((a, b) => b.line - a.line);
  
  for (const error of errors) {
    if (!seenLines.has(error.line)) {
      seenLines.add(error.line);
      uniqueErrors.push(error);
    }
  }

  let modified = false;

  for (const error of uniqueErrors) {
    const lineIndex = error.line - 1;
    // Check if the line above is already a ts-expect-error
    if (lineIndex > 0 && lines[lineIndex - 1].includes('@ts-expect-error')) {
      continue;
    }
    if (lines[lineIndex] && lines[lineIndex].includes('@ts-expect-error')) {
        continue;
    }
    
    // Get indentation of the line
    const matchIndent = lines[lineIndex].match(/^(\s*)/);
    const indent = matchIndent ? matchIndent[1] : '';
    
    lines.splice(lineIndex, 0, `${indent}// @ts-expect-error - ${error.errorCode}`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(absolutePath, lines.join('\n'), 'utf8');
    console.log(`Modified ${file}`);
  }
}

console.log('Done processing TypeScript errors.');
