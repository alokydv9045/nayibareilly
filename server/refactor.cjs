const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src', 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace generic catch blocks that return fail(res, 500, ...)
  // We'll replace them with 'throw error;'
  // Match: } catch (error) { ... return fail(res, 500, ...) }
  content = content.replace(/\} catch \((err|error|e|settingErr|sizeErr)\) \{[\s\S]*?return fail\(res,\s*500,[\s\S]*?\}/g, '} catch ($1) {\n    throw $1;\n  }');

  // In untracked files where we broke it with `} catch () { throw ; }`
  content = content.replace(/\}\s*catch\s*\(\)\s*\{\s*throw\s*;/g, '} catch (error) { throw error;');
  content = content.replace(/\}\s*catch\s*\(\)\s*\{\s*throw\s*;\s*\}/g, '} catch (error) { throw error; }');

  // Replace validationResult checks with ValidationError
  if (content.includes('validationResult(req)')) {
    if (!content.includes('ValidationError')) {
      content = 'import { ValidationError } from \'../utils/errorHandler.js\'\n' + content;
    }
    content = content.replace(/if \(!errors\.isEmpty\(\)\).*?return fail\(res,\s*400,\s*(.*?),.*?\)/g, 'if (!errors.isEmpty()) throw new ValidationError($1, errors.array())');
    content = content.replace(/if \(!errors\.isEmpty\(\)\) {\s*console\.log[^\n]+\s*return fail[^\n]+\n\s*}/g, 'if (!errors.isEmpty()) throw new ValidationError(\'Validation failed\', errors.array())');
    content = content.replace(/if \(!errors\.isEmpty\(\)\) {\s*await authLogger[^\n]+\s*return fail[^\n]+\n\s*}/g, 'if (!errors.isEmpty()) { await authLogger.loginAttempt(req, { status: \'validation_failed\', errors: errors.array() }); throw new ValidationError(\'Validation failed\', errors.array()); }');
  }

  // Replace explicit fail(res, 404, ...) with NotFoundError
  if (content.includes('fail(res, 404')) {
    if (!content.includes('NotFoundError')) {
      if (content.includes('import { ValidationError')) {
        content = content.replace('import { ValidationError', 'import { ValidationError, NotFoundError');
      } else {
        content = 'import { NotFoundError } from \'../utils/errorHandler.js\'\n' + content;
      }
    }
    content = content.replace(/return fail\(res,\s*404,\s*(.*?)\)/g, 'throw new NotFoundError($1)');
  }

  // Replace explicit fail(res, 401/403, ...) with Auth error
  if (content.includes('fail(res, 401') || content.includes('fail(res, 403')) {
    if (!content.includes('AuthenticationError')) {
      if (content.includes('import { NotFoundError')) {
        content = content.replace('import { NotFoundError', 'import { NotFoundError, AuthenticationError, AuthorizationError');
      } else if (content.includes('import { ValidationError')) {
        content = content.replace('import { ValidationError', 'import { ValidationError, AuthenticationError, AuthorizationError');
      } else {
        content = 'import { AuthenticationError, AuthorizationError } from \'../utils/errorHandler.js\'\n' + content;
      }
    }
    content = content.replace(/return fail\(res,\s*401,\s*(.*?)\)/g, 'throw new AuthenticationError($1)');
    content = content.replace(/return fail\(res,\s*403,\s*(.*?)\)/g, 'throw new AuthorizationError($1)');
  }

  fs.writeFileSync(filePath, content);
});
console.log('Refactoring complete');
