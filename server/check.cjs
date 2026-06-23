const fs = require('fs');
const lines = fs.readFileSync('src/controllers/techadmin.controller.js', 'utf8').split('\n');
let backticks = 0;
for (let i = 0; i < 252; i++) {
  const line = lines[i];
  let matches = 0;
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '`') matches++;
  }
  backticks += matches;
  if (matches > 0) console.log(`Line ${i + 1} has ${matches} backticks: ${line}`);
}
console.log('Total backticks before line 252:', backticks);
