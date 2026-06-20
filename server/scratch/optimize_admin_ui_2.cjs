const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Harikesn/Desktop/alok/nayibareilly/client/src/app';
const adminFolders = ['superadmin', 'mayor', 'department', 'staff', 'moderator'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Colors for text need to be darker to be legible on white
  content = content.replace(/text-(purple|emerald|blue|amber|red|cyan|violet|indigo|green|yellow|orange)-[34]00/g, 'text-$1-600');
  
  // Translucent borders
  content = content.replace(/border-(purple|emerald|blue|amber|red|cyan|violet|indigo|green|yellow|orange)-500\/30/g, 'border-$1-200');
  
  // Translucent backgrounds that might have been text-white internally
  content = content.replace(/bg-white\s+border/g, 'bg-white border');
  
  // Cleanup leftover white/10
  content = content.replace(/bg-white\/10/g, 'bg-slate-100');
  
  // Sidebar dark mode bg
  content = content.replace(/bg-slate-950\/80/g, 'bg-white');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Extra optimized:', filePath);
  }
}

function walk(currentDir) {
  if (!fs.existsSync(currentDir)) return;
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

adminFolders.forEach(folder => {
  walk(path.join(baseDir, folder));
});

console.log('Extra UI Optimization Complete');
