import { execSync } from 'child_process';

async function build() {
  try {
    execSync('tsc --project tsconfig.types.json', { stdio: 'inherit' });
    // execSync(`echo '{"type": "commonjs"}' > dist/cjs/package.json`, {
    //   stdio: 'inherit',
    // });
  } catch (error) {
    throw error;
  }
}

build();
