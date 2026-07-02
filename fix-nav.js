const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'client', 'src', 'lib', 'config', 'navigation.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
/<<<<<<< HEAD\r?\n        href: '\/superadmin', \r?\n=======\r?\n        href: '\/techadmin', \r?\n>>>>>>> [a-f0-9]+/,
`        href: '/techadmin',`
);

content = content.replace(
/<<<<<<< HEAD\r?\n        name: 'System Overview', \r?\n        nameHi: 'सिस्टम अवलोकन',\r?\n        href: '\/superadmin\/analytics', \r?\n=======\r?\n        name: 'System Analytics', \r?\n        nameHi: 'सिस्टम विश्लेषिकी',\r?\n        href: '\/techadmin\/analytics', \r?\n>>>>>>> [a-f0-9]+/,
`        name: 'System Analytics', 
        nameHi: 'सिस्टम विश्लेषिकी',
        href: '/techadmin/analytics',`
);

content = content.replace(
/<<<<<<< HEAD\r?\n        name: 'All Admins', \r?\n        nameHi: 'सभी व्यवस्थापक',\r?\n        href: '\/superadmin\/users', \r?\n        icon: Shield,\r?\n        roles: \[UserRole.SUPER_ADMIN\],\r?\n=======\r?\n        name: 'Users', \r?\n        nameHi: 'उपयोगकर्ता',\r?\n        href: '\/techadmin\/users', \r?\n        icon: Users,\r?\n        roles: \[UserRole.TECH_ADMIN\],\r?\n>>>>>>> [a-f0-9]+/,
`        name: 'Users', 
        nameHi: 'उपयोगकर्ता',
        href: '/techadmin/users', 
        icon: Users,
        roles: [UserRole.TECH_ADMIN],`
);

content = content.replace(
/<<<<<<< HEAD\r?\n        name: 'System Logs', \r?\n        nameHi: 'सिस्टम लॉग',\r?\n        href: '\/superadmin\/audit', \r?\n        icon: Database,\r?\n        roles: \[UserRole.SUPER_ADMIN\],\r?\n=======\r?\n        name: 'Audit Logs', \r?\n        nameHi: 'ऑडिट लॉग',\r?\n        href: '\/techadmin\/audit', \r?\n        icon: Shield,\r?\n        roles: \[UserRole.TECH_ADMIN\],\r?\n>>>>>>> [a-f0-9]+/,
`        name: 'Audit Logs', 
        nameHi: 'ऑडिट लॉग',
        href: '/techadmin/audit', 
        icon: Shield,
        roles: [UserRole.TECH_ADMIN],`
);

fs.writeFileSync(file, content);
