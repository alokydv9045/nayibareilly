const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            results.push(file);
        }
    });
    return results;
}

const allFiles = [...walk(path.join(process.cwd(), 'client', 'src')), ...walk(path.join(process.cwd(), 'server', 'src'))];
let cleanedCount = 0;

for (const file of allFiles) {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        try {
            let content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            const newLines = lines.filter(line => !line.includes('456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9'));
            if (newLines.length !== lines.length) {
                fs.writeFileSync(file, newLines.join('\n'), 'utf8');
                console.log('Cleaned stray markers in:', file);
                cleanedCount++;
            }
        } catch (e) {
            console.error('Error cleaning:', file, e.message);
        }
    }
}

console.log('Total files cleaned of stray markers:', cleanedCount);
