const fs = require('fs');
const path = require('path');

function resolveConflictsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('<<<<<<< HEAD')) return false;

    // Match <<<<<<< HEAD optionally followed by anything until newline
    const regex = /<<<<<<< HEAD.*?\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> .*?\r?\n?/g;
    
    const newContent = content.replace(regex, '$1');
    
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        return true;
    }
    return false;
}

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

const dirsToSearch = [
    path.join(process.cwd(), 'client', 'src'),
    path.join(process.cwd(), 'server', 'src')
];

let allFiles = [];
for (const dir of dirsToSearch) {
    allFiles = allFiles.concat(walk(dir));
}

let resolvedCount = 0;

for (const file of allFiles) {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        try {
            if (resolveConflictsInFile(file)) {
                console.log('Resolved conflicts in:', file);
                resolvedCount++;
            }
        } catch (e) {
            console.error('Error resolving:', file, e.message);
        }
    }
}

console.log('Total additional files resolved:', resolvedCount);
