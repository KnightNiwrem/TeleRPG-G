#!/usr/bin/env node

// Script to update import paths for ESM migration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('dist')) {
      fileList = findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update import paths in a file
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace relative imports to add .js extension
    // Match imports like: import { X } from './path' or import X from './path'
    const importRegex = /import\s+(?:(?:\{[^}]*\})|(?:[^{}\s,]+))\s+from\s+['"]([^'"]*)['"]/g;
    
    // Keep track of matched imports to avoid duplicates
    const matchedImports = new Set();
    
    // Use replace with callback to handle each match
    content = content.replace(importRegex, (match, importPath) => {
      // Only handle relative imports (starting with . or ..)
      if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
        matchedImports.add(importPath);
        return match.replace(importPath, `${importPath}.js`);
      }
      return match;
    });
    
    // Update the file with new content
    fs.writeFileSync(filePath, content, 'utf-8');
    
    // Log the changes
    if (matchedImports.size > 0) {
      console.log(`Updated imports in ${filePath}:`);
      matchedImports.forEach(imp => console.log(`  ${imp} -> ${imp}.js`));
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  const srcDir = path.resolve('./src');
  const tsFiles = findTsFiles(srcDir);
  
  console.log(`Found ${tsFiles.length} TypeScript files to process.`);
  
  tsFiles.forEach(file => {
    updateImportsInFile(file);
  });
  
  console.log('Done updating import paths.');
}

main();