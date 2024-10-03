import { globSync as glob } from 'glob';
import fs from 'fs';

const [path, version, isESM] = process.argv.slice(2);

const files = glob(`${path}/**/*.ts`);

// filter file name end with index.ts
const index = files
  .filter((file) => file.endsWith('/index.ts') && file !== `${path}/index.ts`)
  .map((file) => {
    const filepath = file.replace(path, '').split('/').slice(0, -1).join('/');

    let importStatement = `import * as ${version} from '.${filepath}';`;
    if (isESM === 'true') {
      importStatement = `import * as ${version} from '.${filepath}/index.js';`;
    }
    const lines = [importStatement];

    const linesOfFile = fs.readFileSync(file, 'utf8').split('\n');

    const exports = [version];

    linesOfFile.forEach((line) => {
      const [, client] = line.match(/export \{ (\w+) \} from /) ?? [];

      if (client) {
        lines.push(
          ...[
            `const ${client} = ${version}.${client};`,
            `type ${client} = ${version}.${client};`,
          ],
        );
        exports.push(client);
      }
    });

    lines.push(`export { ${exports.join(', ')} };`);
    lines.push(`export default { ${exports.join(', ')} };`);

    return lines.join('\n');
  })
  .filter(Boolean)
  .join('\n');

fs.writeFileSync(`${path}/index.ts`, index);
