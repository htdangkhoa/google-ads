import { globSync as glob } from 'glob';
import fs from 'fs';

const [path] = process.argv.slice(2);

const files = glob(`${path}/**/*.ts`);

// export only Service classes from the files to the index.ts file
const index = files
  .map((file) => {
    const filepath = file.replace(path, '').replace(/\.ts$/, '');
    const content = fs.readFileSync(file, 'utf8');

    const match = content.match(/export const (\w+)ServiceClient =/);

    if (match) {
      return `export { ${match[1]}ServiceClient } from '.${filepath}';`;
    }

    return null;
  })
  .filter(Boolean)
  .join('\n');

fs.writeFileSync(`${path}/index.ts`, index);
