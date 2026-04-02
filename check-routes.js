#!/usr/bin/env node

/**
 * Route Validation Script
 * Checks if all defined routes in ROLE_ROUTES have corresponding page.tsx files
 */

const fs = require('fs');
const path = require('path');

const CLIENT_ROOT = 'C:\\Users\\TechTeam\\Desktop\\Alok\\Nayibareilly\\Nayibareilly\\client\\src\\app';

// Routes from ROLE_ROUTES configuration
const ROUTES_TO_CHECK = {
  CITIZEN: [
    '/',
    '/report',
    '/my-issues',
    '/issue/[id]',
    '/profile',
    '/notifications',
    '/help',
  ],
  MODERATOR: [
    '/moderator',
    '/moderator/dashboard',
    '/moderator/pending',
    '/moderator/analytics',
    '/moderator/history',
    '/issue/[id]',
    '/profile',
    '/notifications',
    '/help',
  ],
  STAFF: [
    '/staff',
    '/staff/assigned',
    '/staff/in-progress',
    '/staff/completed',
    '/issue/[id]',
    '/profile',
    '/notifications',
  ],
  DEPT_ADMIN: [
    '/department',
    '/department/staff',
    '/department/issues',
    '/department/analytics',
    '/issue/[id]',
    '/profile',
    '/notifications',
  ],
  MAYOR: [
    '/mayor',
    '/mayor/overview',
    '/mayor/departments',
    '/mayor/analytics',
    '/mayor/approvals',
    '/issue/[id]',
    '/profile',
    '/notifications',
  ],
  SUPER_ADMIN: [
    '/superadmin',
    '/superadmin/users',
    '/superadmin/departments',
    '/superadmin/settings',
    '/superadmin/analytics',
    '/superadmin/audit',
    '/issue/[id]',
    '/profile',
    '/notifications',
  ]
};

function checkRouteExists(route) {
  // Handle dynamic routes like /issue/[id]
  let filePath = route === '/' ? '/page.tsx' : route + '/page.tsx';
  let fullPath = path.join(CLIENT_ROOT, filePath.replace(/\//g, path.sep));
  
  // Handle dynamic route brackets [id] -> [id]
  if (route.includes('/:id')) {
    fullPath = fullPath.replace('/:id', '/[id]');
  }
  
  return {
    route,
    expected: fullPath,
    exists: fs.existsSync(fullPath),
    actualPath: fullPath
  };
}

function main() {
  console.log('🔍 Checking Route-to-Page Mapping');
  console.log('=====================================\n');
  
  const results = {};
  const missing = [];
  const existing = [];
  
  for (const [role, routes] of Object.entries(ROUTES_TO_CHECK)) {
    console.log(`📋 ${role} Routes:`);
    results[role] = [];
    
    for (const route of routes) {
      const result = checkRouteExists(route);
      results[role].push(result);
      
      if (result.exists) {
        console.log(`  ✅ ${route}`);
        existing.push(route);
      } else {
        console.log(`  ❌ ${route} → ${result.expected}`);
        missing.push({ route, role, expected: result.expected });
      }
    }
    console.log('');
  }
  
  // Summary
  console.log('📊 Summary:');
  console.log(`✅ Existing pages: ${existing.length}`);
  console.log(`❌ Missing pages: ${missing.length}\n`);
  
  if (missing.length > 0) {
    console.log('🚨 Missing Pages:');
    missing.forEach(({ route, role, expected }) => {
      console.log(`  • ${route} (${role}) → ${expected}`);
    });
    console.log('');
  }
  
  // Group missing by priority
  const criticalMissing = missing.filter(m => 
    ['/moderator/dashboard', '/staff/assigned', '/department/analytics', '/mayor/overview', '/superadmin/users'].includes(m.route)
  );
  
  if (criticalMissing.length > 0) {
    console.log('🔥 Critical Missing Pages:');
    criticalMissing.forEach(({ route, role }) => {
      console.log(`  • ${route} (${role})`);
    });
  }
}

main();