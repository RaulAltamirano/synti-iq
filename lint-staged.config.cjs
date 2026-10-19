module.exports = {
  'api/**/*.{ts,tsx,js}': filenames => {
    const files = filenames.map(f => f.replace(/^api\//, ''));
    return [
      `yarn --cwd api eslint --fix ${files.join(' ')}`,
      `yarn --cwd api prettier --write ${files.join(' ')}`,
    ];
  },
  'api/**/*.{json,md,yml,yaml}': filenames => {
    const files = filenames.map(f => f.replace(/^api\//, ''));
    return [`yarn --cwd api prettier --write ${files.join(' ')}`];
  },
  'web/src/**/*.{ts,vue,js,mjs,cjs,json,css,md}': filenames => {
    const files = filenames.map(f => f.replace(/^web\//, ''));
    return [
      `yarn --cwd web eslint --fix ${files.join(' ')}`,
      `yarn --cwd web prettier --write ${files.join(' ')}`,
    ];
  },
};
