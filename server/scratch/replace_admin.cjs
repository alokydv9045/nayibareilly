const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Harikesn/Desktop/alok/nayibareilly/server/src/routes';

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace variations
      let newContent = content.replace(/'ADMIN'/g, "'DEPT_ADMIN', 'MAYOR'");
      
      // Clean up duplicates if DEPT_ADMIN appears multiple times in the same array
      newContent = newContent.replace(/'DEPT_ADMIN',\s*'MAYOR',\s*'MODERATOR',\s*'DEPT_ADMIN'/g, "'DEPT_ADMIN', 'MAYOR', 'MODERATOR'");
      newContent = newContent.replace(/'DEPT_ADMIN',\s*'MAYOR',\s*'DEPT_ADMIN'/g, "'DEPT_ADMIN', 'MAYOR'");
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated:', fullPath);
      }
    }
  }
}

walk(dir);
console.log('Done');
