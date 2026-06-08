import fs from 'fs';

let c = fs.readFileSync('src/routes/v1/admin/index.js', 'utf8');

c = c.replace(/router\.patch\('\/users\/:userId\/roles', \[\s*auth\(\['SUPER_ADMIN'\]\),\s*body\('roles'\)\.isArray\(\)\.notEmpty\(\)\s*\], async \(req, res\) => \{\s*\/\/ This will be implemented in admin\.controller\.js\s*res\.status\(501\).*?\}\);/g, "router.patch('/users/:userId/roles', [\n  auth(['SUPER_ADMIN']),\n  body('roles').isArray().notEmpty()\n], updateUserRoles);");

c = c.replace(/router\.patch\('\/users\/:userId\/activate', \[\s*auth\(\['SUPER_ADMIN', 'ADMIN'\]\)\s*\], async \(req, res\) => \{\s*\/\/ This will be implemented in admin\.controller\.js\s*res\.status\(501\).*?\}\);/g, "router.patch('/users/:userId/activate', [\n  auth(['SUPER_ADMIN', 'ADMIN'])\n], activateUser);");

c = c.replace(/router\.patch\('\/users\/:userId\/deactivate', \[\s*auth\(\['SUPER_ADMIN', 'ADMIN'\]\)\s*\], async \(req, res\) => \{\s*\/\/ This will be implemented in admin\.controller\.js\s*res\.status\(501\).*?\}\);/g, "router.patch('/users/:userId/deactivate', [\n  auth(['SUPER_ADMIN', 'ADMIN'])\n], deactivateUser);");

c = c.replace(/router\.get\('\/activity-logs', \[\s*auth\(\['SUPER_ADMIN', 'ADMIN'\]\),\s*query\('userId'\)\.optional\(\)\.isString\(\),\s*query\('issueId'\)\.optional\(\)\.isString\(\),\s*query\('page'\)\.optional\(\)\.isInt\(\{ min: 1 \}\),\s*query\('limit'\)\.optional\(\)\.isInt\(\{ min: 1, max: 100 \}\)\s*\], async \(req, res\) => \{\s*\/\/ This will be implemented in admin\.controller\.js\s*res\.status\(501\).*?\}\);/g, "router.get('/activity-logs', [\n  auth(['SUPER_ADMIN', 'ADMIN']),\n  query('userId').optional().isString(),\n  query('issueId').optional().isString(),\n  query('page').optional().isInt({ min: 1 }),\n  query('limit').optional().isInt({ min: 1, max: 100 })\n], getActivityLogs);");

c = c.replace(/router\.patch\('\/categories\/:id', \[\s*auth\(\['SUPER_ADMIN', 'ADMIN'\]\),\s*body\('name'\)\.optional\(\)\.isString\(\)\.trim\(\)\.isLength\(\{ min: 2, max: 100 \}\),\s*body\('description'\)\.optional\(\)\.isString\(\),\s*body\('icon'\)\.optional\(\)\.isString\(\)\s*\], async \(req, res\) => \{\s*res\.status\(501\).*?\}\);/g, "router.patch('/categories/:id', [\n  auth(['SUPER_ADMIN', 'ADMIN']),\n  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),\n  body('description').optional().isString(),\n  body('icon').optional().isString()\n], updateCategory);");

c = c.replace(/router\.delete\('\/categories\/:id', \[\s*auth\(\['SUPER_ADMIN'\]\)\s*\], async \(req, res\) => \{\s*res\.status\(501\).*?\}\);/g, "router.delete('/categories/:id', [\n  auth(['SUPER_ADMIN'])\n], deleteCategory);");

c = c.replace(/router\.get\('\/categories\/:id', \[\s*auth\(\)\s*\], getCategory\);\s*\}\);/g, "router.get('/categories/:id', [\n  auth()\n], getCategory);");

fs.writeFileSync('src/routes/v1/admin/index.js', c);
