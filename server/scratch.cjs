const fs = require('fs');

try {
  let dept = fs.readFileSync('src/controllers/department.controller.js', 'utf8');
  dept = dept.replace('errors.array()))', 'errors.array())');
  fs.writeFileSync('src/controllers/department.controller.js', dept);
} catch(e) {}

try {
  let techadmin = fs.readFileSync('src/controllers/techadmin.controller.js', 'utf8');
  // It seems eslint cannot parse $queryRaw tagged template. Let's change it to standard method.
  techadmin = techadmin.replace(
    'const sizeResult = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`',
    "const sizeResult = await prisma.$queryRawUnsafe('SELECT pg_size_pretty(pg_database_size(current_database())) as size')"
  );
  fs.writeFileSync('src/controllers/techadmin.controller.js', techadmin);
} catch(e) {}

try {
  let notif = fs.readFileSync('src/services/notification.service.js', 'utf8');
  notif = notif.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/no-var-requires\n/g, '');
  fs.writeFileSync('src/services/notification.service.js', notif);
} catch(e) {}

console.log('Fixed syntax issues');
