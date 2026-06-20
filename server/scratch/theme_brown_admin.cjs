const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Harikesn/Desktop/alok/nayibareilly/client/src/app';
const adminFolders = ['superadmin', 'mayor', 'department', 'staff', 'moderator'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  const isLayout = path.basename(filePath) === 'layout.tsx';

  if (isLayout) {
    // Sidebar modifications
    // In layout: min-h-screen bg-white text-slate-900 flex -> min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 text-slate-900 flex
    content = content.replace(/min-h-screen bg-white/g, 'min-h-screen bg-gradient-to-br from-amber-50 to-orange-50');
    content = content.replace(/min-h-screen bg-slate-50/g, 'min-h-screen bg-gradient-to-br from-amber-50 to-orange-50');
    
    // Sidebar bg
    content = content.replace(/aside className="fixed left-0 top-0 h-full w-[0-9]+ bg-white/g, (match) => {
      return match.replace('bg-white', 'bg-amber-950');
    });
    content = content.replace(/border-slate-200 flex flex-col/g, 'border-amber-900 flex flex-col');
    
    // Sidebar link active states
    content = content.replace(/bg-slate-200 text-slate-900/g, 'bg-amber-900 text-white');
    // Sidebar link inactive states
    content = content.replace(/text-slate-500 hover:text-slate-900 hover:bg-slate-100/g, 'text-amber-200/50 hover:text-white hover:bg-amber-900/50');
    
    // Icons in sidebar (like Crown)
    content = content.replace(/Crown className="h-6 w-6 text-slate-900"/g, 'Crown className="h-6 w-6 text-white"');
    
    // Logout button
    content = content.replace(/text-slate-500 hover:text-red-600/g, 'text-amber-200/50 hover:text-red-400');
  }

  // General page modifications for the light brown theme
  // Page container backgrounds
  content = content.replace(/min-h-screen bg-slate-50/g, 'min-h-screen bg-gradient-to-br from-amber-50 to-orange-50');
  content = content.replace(/min-h-screen bg-white/g, 'min-h-screen bg-gradient-to-br from-amber-50 to-orange-50');
  
  // Header text colors
  content = content.replace(/text-slate-900/g, 'text-amber-950');
  content = content.replace(/text-slate-500/g, 'text-amber-800/80');
  
  // Borders
  content = content.replace(/border-slate-200/g, 'border-amber-200/60');
  content = content.replace(/border-slate-100/g, 'border-amber-100');
  content = content.replace(/border-slate-300/g, 'border-amber-300/60');
  
  // Card and topbar backgrounds
  content = content.replace(/bg-slate-50/g, 'bg-amber-50/50');
  content = content.replace(/bg-slate-100/g, 'bg-amber-100/50');
  content = content.replace(/bg-slate-200/g, 'bg-amber-200/50');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Themed brown:', filePath);
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

console.log('Brown Theme Application Complete');
