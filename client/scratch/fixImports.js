const fs = require('fs');

const files = [
  'src/hooks/api/usePublic.ts',
  'src/hooks/features/useRealtimeCacheInvalidation.ts',
  'src/lib/services/socket-service.ts'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import logger from '(@\/lib\/utils\/logger)'/g, "import { logger } from '$1'");
  fs.writeFileSync(f, c);
  console.log('Fixed', f);
});
