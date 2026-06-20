const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Harikesn/Desktop/alok/nayibareilly/client/src/app';
const adminFolders = ['superadmin', 'mayor', 'department', 'staff', 'moderator'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Background gradients and main backgrounds
  content = content.replace(/bg-gradient-to-br\s+from-slate-950\s+via-[a-z]+-950\s+to-[a-z]+-950/g, 'bg-slate-50');
  content = content.replace(/bg-slate-950(?:\/80)?/g, 'bg-white');
  content = content.replace(/bg-slate-900/g, 'bg-slate-50');
  
  // Text colors
  content = content.replace(/text-white\/[1-9]0?/g, 'text-slate-500');
  content = content.replace(/text-white(?![A-Za-z0-9\-\/])/g, 'text-slate-900');
  
  // Translucent backgrounds
  content = content.replace(/bg-white\/5/g, 'bg-white');
  content = content.replace(/bg-white\/8/g, 'bg-slate-50');
  content = content.replace(/bg-white\/10/g, 'bg-slate-100');
  content = content.replace(/bg-white\/20/g, 'bg-slate-200');
  
  // Hover states for backgrounds
  content = content.replace(/hover:bg-white\/10/g, 'hover:bg-slate-50');
  content = content.replace(/hover:bg-white\/8/g, 'hover:bg-slate-50');
  content = content.replace(/hover:bg-white\/5/g, 'hover:bg-slate-50');
  content = content.replace(/hover:bg-white\/20/g, 'hover:bg-slate-100');

  // Borders
  content = content.replace(/border-white\/[1-9]0?/g, 'border-slate-200');
  
  // Optimization: Remove backdrop filters which are computationally expensive
  content = content.replace(/backdrop-blur-(?:xl|lg|md|sm)/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Optimized and themed:', filePath);
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

console.log('UI Optimization Complete');
