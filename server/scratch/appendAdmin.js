import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerPath = path.join(__dirname, '../src/controllers/admin.controller.js');
const routerPath = path.join(__dirname, '../src/routes/v1/admin/index.js');

const controllerAppend = `
// =====================
// Unimplemented Routes Fix
// =====================

export const updateUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;
    
    if (!roles || !Array.isArray(roles)) {
      return fail(res, 400, 'Roles array is required');
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { roles }
    });
    
    return ok(res, { user });
  } catch (error) {
    console.error('Update user roles error:', error);
    return fail(res, 500, 'Failed to update user roles');
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });
    return ok(res, { user });
  } catch (error) {
    console.error('Activate user error:', error);
    return fail(res, 500, 'Failed to activate user');
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
    return ok(res, { user });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return fail(res, 500, 'Failed to deactivate user');
  }
};

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.issueCategory.findUnique({
      where: { id }
    });
    if (!category) return fail(res, 404, 'Category not found');
    return ok(res, { category });
  } catch (error) {
    console.error('Get category error:', error);
    return fail(res, 500, 'Failed to get category');
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color } = req.body;
    
    const category = await prisma.issueCategory.update({
      where: { id },
      data: { name, description, icon, color }
    });
    
    return ok(res, { category });
  } catch (error) {
    console.error('Update category error:', error);
    return fail(res, 500, 'Failed to update category');
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.issueCategory.delete({
      where: { id }
    });
    return ok(res, { message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return fail(res, 500, 'Failed to delete category');
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { userId, issueId, page = 1, limit = 20 } = req.query;
    
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    
    const where = {};
    if (userId) where.userId = userId;
    if (issueId) where.issueId = issueId;
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: { select: { name: true, email: true } },
        }
      }),
      prisma.auditLog.count({ where })
    ]);
    
    return ok(res, {
      items: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    return fail(res, 500, 'Failed to get activity logs');
  }
};
`;

let controllerCode = fs.readFileSync(controllerPath, 'utf8');
if (!controllerCode.includes('updateUserRoles')) {
  fs.writeFileSync(controllerPath, controllerCode + '\n' + controllerAppend);
  console.log('Appended to controller.');
}

// Read router
let routerCode = fs.readFileSync(routerPath, 'utf8');
routerCode = routerCode.replace(/import {([^}]+)} from '\.\.\/\.\.\/\.\.\/controllers\/admin\.controller\.js';/, (match, group) => {
  if (group.includes('updateUserRoles')) return match;
  return "import {" + group + ", updateUserRoles, activateUser, deactivateUser, getCategory, updateCategory, deleteCategory, getActivityLogs } from '../../../controllers/admin.controller.js';";
});

// precise string replace for the router
routerCode = routerCode.replace(
  /router\.patch\('\/users\/:userId\/roles', \[[^\]]+\], async \(req, res\) => \{\s*\/\/ This will be implemented in admin.controller.js\s*res\.status\(501\).+?\s*\}\);/s,
  "router.patch('/users/:userId/roles', [\n  auth(['SUPER_ADMIN']),\n  body('roles').isArray().notEmpty()\n], updateUserRoles);"
);

routerCode = routerCode.replace(
  /router\.patch\('\/users\/:userId\/activate', \[[^\]]+\], async \(req, res\) => \{\s*\/\/ This will be implemented in admin.controller.js\s*res\.status\(501\).+?\s*\}\);/s,
  "router.patch('/users/:userId/activate', [\n  auth(['SUPER_ADMIN', 'ADMIN'])\n], activateUser);"
);

routerCode = routerCode.replace(
  /router\.patch\('\/users\/:userId\/deactivate', \[[^\]]+\], async \(req, res\) => \{\s*\/\/ This will be implemented in admin.controller.js\s*res\.status\(501\).+?\s*\}\);/s,
  "router.patch('/users/:userId/deactivate', [\n  auth(['SUPER_ADMIN', 'ADMIN'])\n], deactivateUser);"
);

routerCode = routerCode.replace(
  /router\.get\('\/activity-logs', \[[^\]]+\], async \(req, res\) => \{\s*\/\/ This will be implemented in admin.controller.js\s*res\.status\(501\).+?\s*\}\);/s,
  "router.get('/activity-logs', [\n  auth(['SUPER_ADMIN', 'ADMIN']),\n  query('userId').optional().isString(),\n  query('issueId').optional().isString(),\n  query('page').optional().isInt({ min: 1 }),\n  query('limit').optional().isInt({ min: 1, max: 100 })\n], getActivityLogs);"
);

routerCode = routerCode.replace(
  /router\.get\('\/categories\/:id', \[[^\]]+\], async \(req, res\) => \{\s*res\.status\(501\).+?\s*\}\);/s,
  "router.get('/categories/:id', [\n  auth()\n], getCategory);"
);

routerCode = routerCode.replace(
  /router\.patch\('\/categories\/:id', \[[^\]]+\], async \(req, res\) => \{\s*res\.status\(501\).+?\s*\}\);/s,
  "router.patch('/categories/:id', [\n  auth(['SUPER_ADMIN', 'ADMIN']),\n  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),\n  body('description').optional().isString(),\n  body('icon').optional().isString()\n], updateCategory);"
);

routerCode = routerCode.replace(
  /router\.delete\('\/categories\/:id', \[[^\]]+\], async \(req, res\) => \{\s*res\.status\(501\).+?\s*\}\);/s,
  "router.delete('/categories/:id', [\n  auth(['SUPER_ADMIN'])\n], deleteCategory);"
);

fs.writeFileSync(routerPath, routerCode);
console.log('Updated router.');
