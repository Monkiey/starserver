process.env.SKIP_ENV_VALIDATION = '1';

const path = require('path');

const buildEslintCommand = (filenames) => {
  const appFiles = filenames
    .map((f) => path.relative(process.cwd(), f))
    .filter((f) => f.startsWith('src/'));
  return appFiles.length > 0
    ? `npx next lint --fix --file "${appFiles.join('" --file "')}"`
    : 'echo "No app files to lint"';
};

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '*.{css,scss,sass,less,styl,json,js,tsx,ts,cjs,mjs}': ['prettier --write'],
};
