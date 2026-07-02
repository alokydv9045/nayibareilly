const fs = require('fs');
const path = require('path');

const files = [
    'client/src/app/techadmin/analytics/page.tsx',
    'client/src/app/techadmin/audit/page.tsx',
    'client/src/app/techadmin/settings/page.tsx',
    'client/src/app/techadmin/users/page.tsx'
];

for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find the duplicated </header> block
    // The typical structure is:
    //         </div>
    //         <div className="flex items-center gap-3 w-full sm:w-auto">
    //            ... buttons ...
    //         </div>
    //       </header>
    // 
    // And we just want to replace it with:
    //         </div>
    //       </div>

    const regex = /<\/div>\s*<div className="flex items-center gap-3 w-full sm:w-auto">[\s\S]*?<\/div>\s*<\/header>/g;
    const newContent = content.replace(regex, '</div>\n      </div>');
    
    if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Fixed headers in:', file);
    }
}
