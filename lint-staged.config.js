module.exports = {
  '**/*.+(js|json|less|css|ts|tsx|md)': [
    'eslint --fix',
    'prettier --write',
    'git add',
  ],
};
