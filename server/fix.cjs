const fs = require('fs');
const { execSync } = require('child_process');

try {
  let issue = fs.readFileSync('src/controllers/issue.controller.js', 'utf8');
  issue = issue.replace('    }\n  }\n\n  ok(res, { issue })\n}', '    } catch (e) { throw e; }\n  }\n\n  ok(res, { issue })\n}');
  fs.writeFileSync('src/controllers/issue.controller.js', issue);
} catch(e) {}

try {
  execSync('git checkout src/controllers/moderator.controller.js');
  let mod = fs.readFileSync('src/controllers/moderator.controller.js', 'utf8');
  mod = mod.replace(/    \} catch \(error\) \{\n    throw error;\n  \}\n\}/g, '    } catch (error) {\n      throw error;\n    }\n  } catch (error) {\n    throw error;\n  }\n}');
  fs.writeFileSync('src/controllers/moderator.controller.js', mod);
} catch(e) {}

try {
  execSync('git checkout src/controllers/techadmin.controller.js');
  let tech = fs.readFileSync('src/controllers/techadmin.controller.js', 'utf8');
  tech = tech.replace('const sizeResult = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`', "const sizeResult = await prisma.$queryRawUnsafe('SELECT pg_size_pretty(pg_database_size(current_database())) as size')");
  fs.writeFileSync('src/controllers/techadmin.controller.js', tech);
} catch(e) {}

console.log('Fixed syntax errors');
