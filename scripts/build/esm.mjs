import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

async function build() {
  // const indexFile = path.resolve(process.cwd(), 'src', 'lib', 'index.ts');

  // const indexContent = fs.readFileSync(indexFile, 'utf-8');

  // const requirePolyfill = `
  //   import { createRequire } from 'module';
  //   const require = createRequire(import.meta.url);
  //   global.require = require;
  // `;

  // const esmIndexContent = requirePolyfill + indexContent;

  // fs.writeFileSync(indexFile, esmIndexContent);

  try {
    execSync('tsc --project tsconfig.esm.json', { stdio: 'inherit' });
    execSync(`echo '{"type": "module"}' > dist/esm/package.json`, {
      stdio: 'inherit',
    });
  } catch (error) {
    throw error;
  } finally {
    // fs.writeFileSync(indexFile, indexContent);
  }
}

build();
