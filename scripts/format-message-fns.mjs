import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';

async function main() {
  const files = await glob(
    path.resolve(process.cwd(), 'src', 'generated', '**', '*'),
  );

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // export const AdTextAsset: MessageFns<AdTextAsset> = {

    content = content.replace(
      /export const (\w+):\s+MessageFns<\w+> =\s+{/g,
      'export const $1: MessageFns<$1> & $1 = {',
    );

    fs.writeFileSync(file, content);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
