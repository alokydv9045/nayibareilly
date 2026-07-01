const fs = require('fs');
const path = require('path');

const replacements = [
  // Primary Interactive
  { from: /blue-500/g, to: 'emerald-500' },
  { from: /blue-600/g, to: 'emerald-600' },
  { from: /blue-700/g, to: 'emerald-700' },
  { from: /blue-50/g, to: 'emerald-50' },
  { from: /blue-100/g, to: 'emerald-100' },
  { from: /blue-200/g, to: 'emerald-200' },
  { from: /blue-300/g, to: 'emerald-300' },
  
  // Secondary / Gradients
  { from: /purple-500/g, to: 'slate-700' },
  { from: /purple-600/g, to: 'slate-800' },
  { from: /teal-400/g, to: 'emerald-400' },
  
  // Neutrals (Gray -> Slate)
  { from: /gray-50/g, to: 'slate-50' },
  { from: /gray-100/g, to: 'slate-100' },
  { from: /gray-200/g, to: 'slate-200' },
  { from: /gray-300/g, to: 'slate-300' },
  { from: /gray-400/g, to: 'slate-400' },
  { from: /gray-500/g, to: 'slate-500' },
  { from: /gray-600/g, to: 'slate-600' },
  { from: /gray-700/g, to: 'slate-700' },
  { from: /gray-800/g, to: 'slate-800' },
  { from: /gray-900/g, to: 'slate-900' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const r of replacements) {
        content = content.replace(r.from, r.to);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting global theme token replacement...');
processDirectory(path.join(__dirname, 'client', 'src'));
console.log('Theme replacement complete.');
